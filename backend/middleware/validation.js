/**
 * ฟังก์ชันช่วยตรวจสอบอักขระพิเศษที่อันตราย
 */
const hasDangerousCharacters = (str) => {
    const dangerousPatterns = /<script|<iframe|javascript:|onerror=|onclick=/i;
    return dangerousPatterns.test(str);
};

/**
 * Middleware สำหรับตรวจสอบข้อมูลรีวิวก่อนบันทึก
 */
const validateReview = (req, res, next) => {
    const { restaurantId, userName, rating, comment } = req.body;
    const errors = [];

    // ========================================
    // ✅ ตรวจสอบ restaurantId (ครบ 100%)
    // ========================================
    if (!restaurantId) {
        errors.push('กรุณาระบุรหัสร้านอาหาร');
    } else if (isNaN(Number(restaurantId)) || Number(restaurantId) <= 0) {
        errors.push('รหัสร้านต้องเป็นตัวเลขมากกว่า 0');
    }

    // ========================================
    // ✅ ตรวจสอบ userName
    // ========================================
    // เงื่อนไข:
    // - ต้องมีค่า (ไม่ว่างเปล่า)
    // - ความยาว 2-50 ตัวอักษร (หลัง trim())
    // - ไม่มีอักขระพิเศษที่อันตราย (ใช้ hasDangerousCharacters)
    //
    // ตัวอย่าง error messages:
    // - 'กรุณากรอกชื่อ'
    // - 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร'
    // - 'ชื่อต้องไม่เกิน 50 ตัวอักษร'
    // - 'ชื่อมีอักขระที่ไม่อนุญาต'
    //
    const trimmedName = (userName || '').trim();
    if (!trimmedName) {
        errors.push('กรุณากรอกชื่อ');
    } else if (trimmedName.length < 2) {
        errors.push('ชื่อต้องมีอย่างน้อย 2 ตัวอักษร');
    } else if (trimmedName.length > 50) {
        errors.push('ชื่อต้องไม่เกิน 50 ตัวอักษร');
    } else if (hasDangerousCharacters(trimmedName)) {
        errors.push('ชื่อมีอักขระที่ไม่อนุญาต');
    }

    // ========================================
    // ✅ ตรวจสอบ rating
    // ========================================
    // เงื่อนไข:
    // - ต้องมีค่า
    // - ต้องเป็นตัวเลข
    // - ต้องอยู่ระหว่าง 1-5
    //
    const ratingNum = Number(rating);
    if (rating === undefined || rating === null || rating === '') {
        errors.push('กรุณาเลือกคะแนน');
    } else if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
        errors.push('คะแนนต้องอยู่ระหว่าง 1-5');
    }

    // ========================================
    // ✅ ตรวจสอบ comment
    // ========================================
    // เงื่อนไข:
    // - ต้องมีค่า
    // - ความยาว 10-500 ตัวอักษร (หลัง trim())
    // - ไม่มีอักขระพิเศษที่อันตราย
    //
    // ตัวอย่าง error messages:
    // - 'กรุณากรอกความคิดเห็น'
    // - 'ความคิดเห็นต้องมีอย่างน้อย 10 ตัวอักษร'
    // - 'ความคิดเห็นต้องไม่เกิน 500 ตัวอักษร'
    // - 'ความคิดเห็นมีอักขระที่ไม่อนุญาต'
    //
    const trimmedComment = (comment || '').trim();
    if (!trimmedComment) {
        errors.push('กรุณากรอกความคิดเห็น');
    } else if (trimmedComment.length < 10) {
        errors.push('ความคิดเห็นต้องมีอย่างน้อย 10 ตัวอักษร');
    } else if (trimmedComment.length > 500) {
        errors.push('ความคิดเห็นต้องไม่เกิน 500 ตัวอักษร');
    } else if (hasDangerousCharacters(trimmedComment)) {
        errors.push('ความคิดเห็นมีอักขระที่ไม่อนุญาต');
    }

    // ========================================
    // ✅ ตรวจสอบว่ามี error หรือไม่
    // ========================================
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'ข้อมูลไม่ถูกต้อง',
            errors: errors
        });
    }

    next();
};

module.exports = {
    validateReview
};