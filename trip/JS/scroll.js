const scrollTop = function () {
  const scrollBtn = document.createElement("button");
  scrollBtn.innerHTML = "&uarr;";
  scrollBtn.setAttribute("id", "scroll-btn");
  document.body.appendChild(scrollBtn);

  // 스크롤 거리에 따라 버튼 숨기기, 보이기
  const scrollBtnDisplay = function () {
    // 스크롤 탑 버튼 빠르게 조절
    window.scrollY > 0? scrollBtn.classList.add("show") : scrollBtn.classList.remove("show");
  };
  window.addEventListener("scroll", scrollBtnDisplay);

  // 버튼을 클릭하면 상단으로 스크롤
  const scrollWindow = function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  scrollBtn.addEventListener("click", scrollWindow);
};
scrollTop();