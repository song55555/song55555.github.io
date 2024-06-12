const toggleBtn = document.querySelector('.header_toggleBtn');
const menu = document.querySelector('.menu');
const icons = document.querySelector('.menu_icons');

// 햄버거 버튼 클릭 활성화
toggleBtn.addEventListener('click', () => {
  menu.classList.toggle('active');
  // icons.classList.toggle('active');
});