const express = require('express');
const cors = require('cors');
require('dotenv').config();

const restaurantRoutes = require('./routes/restaurants');
const reviewRoutes = require('./routes/reviews');
const { readJsonFile } = require('./utils/fileManager');

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// Middleware
// ========================================
app.use(cors());

// ✅ แก้ไขสำคัญ: ต้อง parse JSON body ก่อน route ทุกตัว
app.use(express.json());

// ========================================
// Routes
// ========================================
app.get('/', (req, res) => {
  res.json({
    message: '🍜 Restaurant Review API',
    version: '1.0.0',
    endpoints: {
      restaurants: '/api/restaurants',
      reviews: '/api/reviews',
      stats: '/api/stats'
    }
  });
});

app.use('/api/restaurants', restaurantRoutes);
app.use('/api/reviews', reviewRoutes);

// ========================================
// GET /api/stats - ดึงสถิติทั้งหมด
// ========================================
// งานที่ต้องทำ:
// 1. อ่านข้อมูล restaurants.json และ reviews.json
// 2. คำนวณ:
//    - totalRestaurants: จำนวนร้านทั้งหมด
//    - totalReviews: จำนวนรีวิวทั้งหมด
//    - averageRating: คะแนนเฉลี่ยของร้านทั้งหมด (ปัดเศษ 1 ตำแหน่ง)
//    - topRatedRestaurants: ร้าน 5 อันดับแรกที่มี rating สูงสุด
// 3. ส่งข้อมูลกลับในรูปแบบ: { success: true, data: {...} }

app.get('/api/stats', async (req, res) => {
  try {
    // ✅ 1. อ่านข้อมูลจากไฟล์ JSON
    const restaurants = await readJsonFile('./data/restaurants.json');
    const reviews = await readJsonFile('./data/reviews.json');

    // ✅ 2. คำนวณจำนวนร้านและรีวิวทั้งหมด
    const totalRestaurants = restaurants.length;
    const totalReviews = reviews.length;

    // ✅ 3. รวมคะแนนเฉลี่ยของร้านทั้งหมด (เฉพาะร้านที่มีรีวิว)
    const ratedRestaurants = restaurants.filter(r => r.averageRating > 0);
    const totalRatingSum = ratedRestaurants.reduce((sum, r) => sum + r.averageRating, 0);
    const averageRating = ratedRestaurants.length > 0
      ? parseFloat((totalRatingSum / ratedRestaurants.length).toFixed(1))
      : 0;

    // ✅ 4. หา 5 ร้านที่คะแนนสูงสุด (เรียงจากมากไปน้อย)
    const topRatedRestaurants = [...restaurants]
      .filter(r => r.averageRating > 0)
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 5)
      .map(r => ({
        id: r.id,
        name: r.name,
        averageRating: r.averageRating
      }));

    // ✅ 5. ส่งข้อมูลกลับ
    res.json({
      success: true,
      data: {
        totalRestaurants,
        totalReviews,
        averageRating,
        topRatedRestaurants
      }
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงสถิติ'
    });
  }
});

// ========================================
// 404 Handler
// ========================================
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// ========================================
// Error Handler
// ========================================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ========================================
// Start Server
// ========================================
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV}`);
});