// HTML 문서가 모두 로드되었을 때 실행
document.addEventListener('DOMContentLoaded', () => {
  
  // 'card' 클래스를 가진 모든 요소를 선택
  const cards = document.querySelectorAll('.card');

  // 각 카드에 대해 클릭 이벤트 리스너를 추가
  cards.forEach(card => {
    card.addEventListener('click', () => {
      // 카드가 가지고 있는 'data-href' 속성 값을 가져옴
      const href = card.dataset.href;

      // data-href 속성이 존재하면 해당 링크를 "현재 탭"에서 연다
      if (href) {
        // [수정됨] 새 탭이 아닌 현재 탭에서 열기
        window.location.href = href;
      }
    });
  });
});