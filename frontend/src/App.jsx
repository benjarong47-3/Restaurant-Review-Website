import { useState, useEffect } from 'react';
import RestaurantList from './components/RestaurantList';
import RestaurantDetail from './components/RestaurantDetail';
import './App.css';

function App() {
  // state เก็บ ID ของร้านที่ถูกเลือก
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);

  // state สำหรับ Dark/Light Mode
  const [darkMode, setDarkMode] = useState(false);

  // โหลดค่า theme เก่าจาก localStorage
  useEffect(() => {
    if (localStorage.getItem('theme') === 'dark') {
      setDarkMode(true);
      document.body.classList.add('dark-mode');
    }
  }, []);

  // toggle theme
  const toggleTheme = () => {
    if (darkMode) {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    }
    setDarkMode(!darkMode);
  };

  // เมื่อผู้ใช้เลือกดูรายละเอียดร้าน
  const handleSelectRestaurant = (id) => {
    setSelectedRestaurantId(id);
  };

  // กลับไปหน้าร้านทั้งหมด
  const handleBack = () => {
    setSelectedRestaurantId(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🍜 Restaurant Review</h1>
        <p>ค้นหาและรีวิวร้านอาหารโปรดของคุณ</p>

        {/* ปุ่ม Toggle Dark/Light Mode */}
        <button
          onClick={toggleTheme}
          className="theme-toggle"
          title="Toggle Dark/Light Mode"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </header>

      <main className="app-main">
        {selectedRestaurantId ? (
          // แสดงรายละเอียดร้านที่ถูกเลือก
          <RestaurantDetail
            restaurantId={selectedRestaurantId}
            onBack={handleBack}
          />
        ) : (
          // แสดงรายการร้านทั้งหมด
          <RestaurantList
            onSelectRestaurant={handleSelectRestaurant}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>&copy; 2024 Restaurant Review App | สร้างด้วย React + Express</p>
      </footer>
    </div>
  );
}

export default App;