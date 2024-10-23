<template>
  <footer class="footer mt-auto py-3 bg-dark text-light">
    <div class="container">
      <div class="row">
        <!-- 網站資訊 -->
        <div class="col-md-4 mb-3">
          <h5 class="mb-3">市民卡系統</h5>
          <p class="mb-2">提供便捷的電影訂票、優惠管理等服務</p>
          <div class="social-links">
            <a href="#" class="me-2" title="Facebook">
              <i class="bi bi-facebook"></i>
            </a>
            <a href="#" class="me-2" title="Instagram">
              <i class="bi bi-instagram"></i>
            </a>
            <a href="#" class="me-2" title="Line">
              <i class="bi bi-line"></i>
            </a>
          </div>
        </div>

        <!-- 快速連結 -->
        <div class="col-md-4 mb-3">
          <h5 class="mb-3">快速連結</h5>
          <ul class="list-unstyled">
            <li class="mb-2">
              <router-link to="/movies" class="text-light text-decoration-none">
                <i class="bi bi-film me-2"></i>電影訂票
              </router-link>
            </li>
            <li class="mb-2">
              <router-link to="/benefits" class="text-light text-decoration-none">
                <i class="bi bi-gift me-2"></i>優惠專區
              </router-link>
            </li>
            <li class="mb-2">
              <router-link to="/wallet" class="text-light text-decoration-none">
                <i class="bi bi-wallet2 me-2"></i>電子錢包
              </router-link>
            </li>
            <li class="mb-2">
              <router-link to="/help" class="text-light text-decoration-none">
                <i class="bi bi-question-circle me-2"></i>使用說明
              </router-link>
            </li>
          </ul>
        </div>

        <!-- 聯絡資訊 -->
        <div class="col-md-4 mb-3">
          <h5 class="mb-3">聯絡我們</h5>
          <ul class="list-unstyled">
            <li class="mb-2">
              <i class="bi bi-geo-alt me-2"></i>
              地址：台北市信義區市府路1號
            </li>
            <li class="mb-2">
              <i class="bi bi-telephone me-2"></i>
              電話：(02) 2720-8889
            </li>
            <li class="mb-2">
              <i class="bi bi-envelope me-2"></i>
              Email：support@citizencard.com
            </li>
            <li class="mb-2">
              <i class="bi bi-clock me-2"></i>
              服務時間：週一至週五 9:00-18:00
            </li>
          </ul>
        </div>
      </div>

      <!-- 版權資訊 -->
      <div class="row mt-3">
        <div class="col-12">
          <hr class="bg-light">
          <div class="d-flex justify-content-between align-items-center flex-wrap">
            <p class="mb-0">
              © {{ currentYear }} 市民卡系統 版權所有
            </p>
            <div class="footer-links">
              <router-link to="/privacy" class="text-light text-decoration-none me-3">
                隱私權政策
              </router-link>
              <router-link to="/terms" class="text-light text-decoration-none me-3">
                使用條款
              </router-link>
              <router-link to="/sitemap" class="text-light text-decoration-none">
                網站地圖
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer',
  computed: {
    currentYear() {
      return new Date().getFullYear()
    }
  }
}
</script>

<style scoped>
.footer {
  position: relative;
  bottom: 0;
  width: 100%;
  background-color: #343a40;
}

.social-links a {
  color: #fff;
  font-size: 1.2rem;
  transition: color 0.3s ease;
}

.social-links a:hover {
  color: #0d6efd;
}

.footer-links a {
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.footer-links a:hover {
  color: #0d6efd !important;
}

.list-unstyled li {
  transition: transform 0.3s ease;
}

.list-unstyled li:hover {
  transform: translateX(5px);
}

@media (max-width: 768px) {
  .footer-links {
    margin-top: 1rem;
  }

  .footer-links a {
    display: block;
    margin-bottom: 0.5rem;
  }
}

/* 動畫效果 */
.social-links a, .footer-links a {
  position: relative;
}

.social-links a::after,
.footer-links a::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 1px;
  bottom: -2px;
  left: 0;
  background-color: #0d6efd;
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.social-links a:hover::after,
.footer-links a:hover::after {
  transform: scaleX(1);
}
</style>