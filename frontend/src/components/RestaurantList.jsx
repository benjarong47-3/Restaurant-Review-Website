import { useState, useEffect, useCallback, useRef } from 'react';
import RestaurantCard from './RestaurantCard';
import SearchBar from './SearchBar';
import FilterPanel from './FilterPanel';
import { getRestaurants } from '../services/api';

function RestaurantList({ onSelectRestaurant }) {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        minRating: '',
        priceRange: ''
    });

    // useRef สำหรับเช็ค render แรก
    const isFirstRender = useRef(true);

    // ========================================
    // 1. useEffect เพื่อ fetch ข้อมูลเมื่อ filters เปลี่ยน
    // ========================================
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            fetchRestaurants(false); // ไม่แสดง loading ตอนแรก
        } else {
            fetchRestaurants(true); // แสดง loading ตอน filter เปลี่ยน
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    // ========================================
    // 2. fetchRestaurants - เรียก API พร้อม filter
    // ========================================
    const fetchRestaurants = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        setError(null);

        try {
            // 2. เรียก getRestaurants พร้อม filters
            const result = await getRestaurants(filters);

            // 3. ตั้งค่า state
            setRestaurants(result.data);
        } catch (err) {
            setError('ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
            console.error(err);
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    // ========================================
    // 4. handleSearch
    // ========================================
    const handleSearch = useCallback((searchTerm) => {
        setFilters(prev => ({ ...prev, search: searchTerm }));
    }, []);

    // ========================================
    // 5. handleFilterChange
    // ========================================
    const handleFilterChange = useCallback((newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    }, []);

    return (
        <div className="restaurant-list-container">
            <SearchBar onSearch={handleSearch} />
            <FilterPanel onFilterChange={handleFilterChange} filters={filters} />

            {loading && <div className="loading">กำลังโหลด...</div>}
            {error && <div className="error">{error}</div>}

            {!loading && !error && (
                <>
                    {restaurants.length === 0 ? (
                        <p className="no-results">ไม่พบร้านอาหารที่ค้นหา ลองเปลี่ยนคำค้นหาหรือตัวกรองดูนะครับ</p>
                    ) : (
                        <div className="restaurant-grid">
                            {restaurants.map(restaurant => (
                                <RestaurantCard
                                    key={restaurant.id}
                                    restaurant={restaurant}
                                    onClick={onSelectRestaurant}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default RestaurantList;