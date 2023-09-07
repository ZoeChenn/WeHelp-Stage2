let allData;
let nextPage = 0;
let keyword = '';
let isLoading = false;
let currentRequest = null;
const searchInput = document.querySelector('.search_input');
const searchButton = document.querySelector('.search_btn');
const contentCards = document.querySelector('.content_cards');
const mrtList = document.querySelector('.mrtBar_list');
const mrtBtnLeft = document.querySelector('.mrtBar_btn-left');
const mrtBtnRight = document.querySelector('.mrtBar_btn-right');
const scrollOffset = 800;

// mrtBar 列表
fetch('/api/mrts')
.then(response => response.json())
.then(data => {
    mrtData = data.data
    renderMrt(mrtData);
})
.catch(function(error){
    console.log("發生錯誤" + error);
});

// 觀測器
const options = {
  root: null,
  rootMargin: '0px',
  threshold: 0.6,
};

const observer = new IntersectionObserver(async (entries) => {
  entries.forEach(async (entry) => {
    if (entry.isIntersecting && !isLoading) {
      isLoading = true;
      if (!keyword) {
        if (nextPage !== null) {
          await homeDataAPI(nextPage);
        } else {
          return
        }
      } else {
        if (nextPage !== null) {
          await searchDataAPI(nextPage, keyword);
        } else {
          return
        }
      }
      isLoading = false;
    }
  });
  setTimeout(() => {
    isLoading = false;
  }, 1000);

}, options);

const detective = document.getElementById('js-detective');
observer.observe(detective);

// 首頁資料
function homeDataAPI(page) {
  if (currentRequest) return;
  currentRequest = fetch(`/api/attractions?page=${page}`)
  currentRequest
    .then(response => response.json())
    .then(data => {
        allData = data.data;
        nextPage = data.nextPage;
        // console.log('homeDataAPI 更新的下一頁:'+ nextPage);
        renderData(allData);
    })
    .catch(function(error){
        console.log("發生錯誤" + error);
    })
    .finally(() => {
      currentRequest = null;
    });
}

// 關鍵字搜尋功能
function searchDataAPI(page, keyword) {
  if (currentRequest) return;
  currentRequest = fetch(`/api/attractions?page=${page}&keyword=${keyword}`)
  currentRequest
    .then(response => response.json())
    .then(data => {
      keyData = data.data;
      nextPage = data.nextPage;
      // console.log('searchDataAPI 更新的下一頁:'+ nextPage);
      // console.log('keyData 長度:'+ keyData.length);
      if (keyData.length === 0) {
        contentCards.innerHTML = '沒有相關結果';
        return;
      } else {
        renderData(keyData);
        isLoading = false;
      }
    })
    .catch(error => {
      console.error("獲取下一頁資訊時發生錯誤:" + error);
    })
    .finally(() => {
      currentRequest = null;
    });
}

// 渲染卡片函式
function renderData(data) {
  const contentCards = document.querySelector(".content_cards");
  // console.log('卡片渲染中')
  data.forEach( attraction => {
    const cardsCard = document.createElement("div");
    cardsCard.classList.add("cards_card");

    const img = document.createElement("img");
    img.src = attraction.images[0];
    img.alt = "";

    const imgDiv = document.createElement("div");
    imgDiv.classList.add("card_img");

    const nameDiv = document.createElement("div");
    nameDiv.classList.add("card_name");

    const detailsDiv = document.createElement("div");
    detailsDiv.classList.add("card_details");
    
    const h4 = document.createElement("h4");
    h4.textContent = attraction.name;

    const h5 = document.createElement("h5");
    h5.textContent = attraction.mrt;

    const h6 = document.createElement("h6");
    h6.textContent = attraction.category;
    
    // 將 img 成為 imgDiv 的子層
    imgDiv.appendChild(img);

    // 將 h4 成為 nameDiv 的子層
    nameDiv.appendChild(h4);

    // 將 h5 及 h6 成為 detailsDiv 的子層
    detailsDiv.appendChild(h5);
    detailsDiv.appendChild(h6);

    // 將 imgDiv、nameDiv 及 detailsDiv 成為 cardsCard 的子層
    cardsCard.appendChild(imgDiv);
    cardsCard.appendChild(nameDiv);
    cardsCard.appendChild(detailsDiv);
    
    // 將 cardsCard 成為 contentCards 的子層
    contentCards.appendChild(cardsCard);
  });
}

// 渲染捷運列表函式
function renderMrt(data) {
  const mrtBarList = document.querySelector(".mrtBar_list");

  data.forEach( mrt => {
    const mrtLi = document.createElement("li");

    const liA = document.createElement("a");
    const mrtName = encodeURIComponent(mrt); // 將站名編碼，防止特殊字符引起的問題
    liA.setAttribute('href', `javascript:void(0);`);
    liA.textContent = mrt;
    
    // 捷運站連結的監聽事件
    liA.addEventListener('click', () => {
      searchInput.value = decodeURIComponent(mrtName); // 解碼以顯示原始捷運站名稱
      searchButton.click();
    });

    // 將 liA 成為 mrtLi 的子層
    mrtLi.appendChild(liA);

    // 將 mrtLi 成為 mrtBarList 的子層
    mrtBarList.appendChild(mrtLi);
  });
}

// mrtBtn 按鈕設置
mrtBtnLeft.addEventListener('click', () => {
  mrtList.scrollTo({
    left: mrtList.scrollLeft - scrollOffset,
    behavior: 'smooth'
  });
});

mrtBtnRight.addEventListener('click', () => {
  mrtList.scrollTo({
    left: mrtList.scrollLeft + scrollOffset,
    behavior: 'smooth'
  });
});

// 輸入關鍵字查詢
searchButton.addEventListener('click', () => {
  nextPage = 0;
  isLoading = true;
  keyword = searchInput.value.trim();
  if (keyword === '') {
    return
  }
  contentCards.innerHTML = '';
  searchDataAPI(nextPage, keyword)
});