import { useEffect } from 'react';
import { initAndPlayMusic } from '../../utils/soundManager';
import "../../styles/App.css";

export default function MainMenu() {
  
  useEffect(() => {
    // تابع کمکی برای راه‌اندازی صدا با اولین لمس یا کلیک کاربر روی صفحه
    const handleFirstTouch = () => {
      initAndPlayMusic();
      // پس از اولین لمس، لیسنر را پاک می‌کنیم تا دوباره اجرا نشود
      window.removeEventListener('click', handleFirstTouch);
      window.removeEventListener('touchstart', handleFirstTouch);
    };

    window.addEventListener('click', handleFirstTouch);
    window.addEventListener('touchstart', handleFirstTouch);

    return () => {
      window.removeEventListener('click', handleFirstTouch);
      window.removeEventListener('touchstart', handleFirstTouch);
    };
  }, []);

  return (
    <div className="main-menu-container">
      {/* بک‌گراند منو از طریق CSS اعمال می‌شود */}
    </div>
  );
}