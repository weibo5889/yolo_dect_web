let currentLanguage = 'zh';
let currentLandmarkData = null;

let currentFilterType = 'spots-only';
let availableTypes = [];
let selectedFilterTypes = new Set();
const translations = {
    zh: {
        header: "影像辨識玩台北",
        recognition: "辨識",
        points: "地圖",
        language: "語言",
        upload: "上傳照片",
        camera: "拍照",
        selectFile: "選擇檔案",
        uploadPrompt: "請上傳圖片",
        pointsTitle: "地圖",
        backButton: "返回辨識頁面",
        detect: "辨識圖片",
        descTitle: "介紹",
        nearbyTitle: "附近地點",
        noData: "(無資料)",
        loading: "辨識中，請稍候...",
        noInfo: "辨識完成，但未找到相關地標資訊",
        distance: "距離",
        nearbyDesc: "地點描述",
        noDesc: "無描述資料",
        recognitionFailed: "未辨識成功，或沒有此建築資料，請換張照片",
        notificationTitle: "辨識失敗",
        notificationClose: "確定",
        selectImagePrompt: "請選擇圖片",
        selectImageTitle: "尚未選擇圖片",
        landmarkFilterLabel: "顯示地標",
        placeFilterLabel: "顯示景點",
        distanceFilterLabel: "顯示範圍",
        walkingTime: "步行時間",
        walkingSteps: "步行距離",
        minutes: "分鐘",
        steps: "步",
        about: "約",
        selectType: "選擇類型",
        filterSelected: "已選擇",
        allTypes: "全部類型"

    },
    en: {
        header: "Photo Recognition in Taipei",
        recognition: "Recognition",
        points: "Map",
        language: "Language",
        upload: "Upload Photo",
        camera: "Take Photo",
        selectFile: "Select File",
        uploadPrompt: "Please upload a photo",
        pointsTitle: "Map",
        backButton: "Back to Recognition Page",
        detect: "Detect Image",
        descTitle: "Description",
        nearbyTitle: "Nearby Places",
        noData: "(No data)",
        loading: "Recognizing, please wait...",
        noInfo: "Recognition completed, but no landmark information found",
        distance: "Distance",
        nearbyDesc: "Place Description",
        noDesc: "No description available",
        recognitionFailed: "Recognition failed,or there is no information about this building. please try another photo",
        notificationTitle: "Recognition Failed",
        notificationClose: "OK",
        selectImagePrompt: "Please select an image",
        selectImageTitle: "No Image Selected",
        landmarkFilterLabel: "Show Landmarks",
        placeFilterLabel: "Show Places",
        distanceFilterLabel: "Display Range",
        walkingTime: "Walking Time",
        walkingSteps: "Walking Distance",
        minutes: "min",
        steps: " steps",
        about: "About ",
        selectType: "Select Type",
        filterSelected: "Selected",
        allTypes: "All Types"
    }
};

function switchLanguage(forceLang) {
    // 如果提供了強制語言參數，則使用該參數；否則切換語言
    if (forceLang) {
        currentLanguage = forceLang;
    } else {
        currentLanguage = (currentLanguage === 'zh') ? 'en' : 'zh';
    }

    // 儲存到 localStorage
    localStorage.setItem('preferredLanguage', currentLanguage);

    const t = translations[currentLanguage];

    // 更新頁面標題和基本UI元素
    const header = document.getElementById('header');
    if (header) {
        header.textContent = t.header;
    }

    // 更新導航按鈕（如果存在）
    const recognitionBtn = document.getElementById('recognitionBtn');
    const mapBtn = document.getElementById('mapBtn');
    const languageBtn = document.getElementById('languageBtn');
    const uploadBtnText = document.getElementById('uploadBtnText');
    const cameraOptionText = document.getElementById('cameraOptionText');
    const fileOptionText = document.getElementById('fileOptionText');

    if (uploadBtnText) uploadBtnText.textContent = t.upload;
    if (cameraOptionText) cameraOptionText.textContent = t.camera;
    if (fileOptionText) fileOptionText.textContent = t.selectFile;
    if (recognitionBtn) recognitionBtn.textContent = t.recognition;
    if (mapBtn) mapBtn.textContent = t.points;
    if (languageBtn) languageBtn.textContent = t.language;

    // 更新辨識頁面元素
    const uploadBtn = document.getElementById('uploadBtn');
    const detectBtn = document.getElementById('detectBtn');
    const uploadPrompt = document.getElementById('uploadPrompt');

    if (uploadBtn) uploadBtn.textContent = t.upload;
    if (detectBtn) detectBtn.textContent = t.detect;
    if (uploadPrompt) uploadPrompt.textContent = t.uploadPrompt;

    // 更新地圖頁面元素
    const pointsTitle = document.getElementById('pointsTitle');
    if (pointsTitle) pointsTitle.textContent = t.pointsTitle;

    // 更新地標頁面元素（如果存在）
    const descTitle = document.getElementById('descTitle');
    const nearbyTitle = document.getElementById('nearbyTitle');
    const distanceFilterLabel = document.getElementById('distanceFilterLabel');

    if (descTitle) descTitle.textContent = t.descTitle;
    if (nearbyTitle) nearbyTitle.textContent = t.nearbyTitle;
    if (distanceFilterLabel) distanceFilterLabel.textContent = t.distanceFilterLabel;

    // **重要：更新地標描述內容**
    const landmarkDesc = document.getElementById('landmarkDesc');
    if (landmarkDesc && currentLandmarkData && currentLandmarkData.building) {
        const building = currentLandmarkData.building;
        const newDesc = currentLanguage === 'zh' ?
            (building.desc || building.dis || t.noData) :
            (building.en_desc || building.eng_dis || building.desc || building.dis || t.noData);

        landmarkDesc.textContent = newDesc;
    }

    // 更新地標名稱（如果存在雙語顯示）
    const landmarkNameZh = document.querySelector('.landmark-hero-name-zh');
    const landmarkNameEn = document.querySelector('.landmark-hero-name-en');

    if (landmarkNameZh && landmarkNameEn && currentLandmarkData && currentLandmarkData.building) {
        const building = currentLandmarkData.building;
        if (currentLanguage === 'zh') {
            // 中文模式：中文名稱大，英文名稱小
            landmarkNameZh.textContent = building.name || building;
            landmarkNameEn.textContent = building.eng_name || building.name || building;
        } else {
            // 英文模式：英文名稱大，中文名稱小
            landmarkNameZh.textContent = building.eng_name || building.name || building;
            landmarkNameEn.textContent = building.name || building;
        }
    }

    // 更新篩選彈出框的標題和按鈕（如果存在）
    const filterModalHeader = document.querySelector('.filter-modal-header h4');
    const applyFilterBtn = document.querySelector('.apply-filter-btn');

    if (filterModalHeader) {
        filterModalHeader.textContent = currentLanguage === 'zh' ? '選擇類型' : 'Select Type';
    }
    if (applyFilterBtn) {
        applyFilterBtn.textContent = currentLanguage === 'zh' ? '套用篩選' : 'Apply Filter';
    }

    // 更新距離顯示（包括「約」字的翻譯）
    const distanceSlider = document.getElementById('distanceSlider');
    if (distanceSlider) {
        updateDistanceDisplay(distanceSlider.value);
    }

    // 更新返回按鈕
    const backButtons = document.querySelectorAll('button[onclick*="goToPage(\'recognitionScreen\')"]');
    backButtons.forEach(btn => {
        btn.textContent = t.backButton;
    });

    // 如果有地標資料，重新生成附近地點以更新類型翻譯
    if (currentLandmarkData) {
        console.log('語言切換：重新生成附近地點內容');

        // **關鍵修復：保存當前的篩選狀態**
        const currentFilterState = new Set(selectedFilterTypes);
        console.log('保存的篩選狀態:', Array.from(currentFilterState));

        // 重新初始化類型選擇器以收集正確語言的類型
        initializeTypeSelector(currentLandmarkData);

        // 重新生成附近地點內容
        updateNearbyPlaces(currentLandmarkData);

        // **關鍵修復：如果之前沒有選擇任何篩選（預設狀態），確保維持「僅景點」**
        if (currentFilterState.size === 0) {
            console.log('維持預設狀態：僅顯示景點');
            selectedFilterTypes.clear();
            // 立即重新應用篩選
            setTimeout(() => {
                filterByMultipleTypes();
                updateFilterButtonText();
            }, 50);
        } else {
            // **如果之前有選擇篩選，嘗試重新映射到新語言**
            console.log('重新映射篩選選項');
            selectedFilterTypes.clear();

            // 這裡可以添加更複雜的類型映射邏輯
            // 暫時先清空，讓用戶重新選擇
            setTimeout(() => {
                filterByMultipleTypes();
                updateFilterButtonText();
            }, 50);
        }
    }

    updateLanguageSelection();
    console.log('語言已切換為:', currentLanguage);
}

function goToPage(pageId) {
    console.log('切換到頁面:', pageId);

    // 如果是地圖頁面，直接跳轉到 map.html
    if (pageId === 'pointsScreen') {
        window.location.href = 'map.html';
        return;
    }

    // 隱藏所有頁面
    const pages = ['recognitionScreen', 'landmarkScreen', 'pointsScreen'];
    pages.forEach(id => {
        const page = document.getElementById(id);
        if (page) {
            page.classList.add('hidden');
        }
    });

    // 顯示目標頁面
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.remove('hidden');
        targetPage.classList.add('page-fade-in');

        // 重新觸發動畫
        setTimeout(() => {
            targetPage.classList.remove('page-fade-in');
        }, 800);

        // 如果切換到地標頁面，顯示捲動按鈕
        if (pageId === 'landmarkScreen') {
            showScrollButtons();
        } else {
            hideScrollButtons();
        }
    } else {
        console.error('找不到頁面:', pageId);
    }
}

function updateLandmarkContent(data) {
    if (!data || !data.building) return;

    const t = translations[currentLanguage];
    const landmarkContainer = document.querySelector('#landmarkScreen .landmark-container');

    // 獲取圖片路徑
    let imageSrc = 'pic/placeholder.jpg';
    if (data.building.image_path) {
        imageSrc = data.building.image_path;
    } else if (data.building.img) {
        imageSrc = data.building.img;
    } else if (data.building.image) {
        imageSrc = data.building.image;
    }

    // 根據當前語言獲取地標名稱
    let landmarkNameZh, landmarkNameEn;
    if (currentLanguage === 'zh') {
        landmarkNameZh = data.building.name || data.building;
        landmarkNameEn = data.building.eng_name || data.building.name || data.building;
    } else {
        landmarkNameZh = data.building.eng_name || data.building.name || data.building;
        landmarkNameEn = data.building.name || data.building;
    }

    // 根據當前語言獲取地標描述
    const landmarkDesc = currentLanguage === 'zh' ?
        (data.building.desc || data.building.dis || t.noData) :
        (data.building.en_desc || data.building.eng_dis || data.building.desc || data.building.dis || t.noData);

    // Debug: 列印描述資料
    console.log('=== 地標描述資料 ===');
    console.log('當前語言:', currentLanguage);
    console.log('中文描述 (desc):', data.building.desc);
    console.log('中文描述 (dis):', data.building.dis);
    console.log('英文描述 (en_desc):', data.building.en_desc);
    console.log('英文描述 (eng_dis):', data.building.eng_dis);
    console.log('最終使用的描述:', landmarkDesc);

    // 重新生成整個地標頁面內容
    landmarkContainer.innerHTML = `
    <div class="landmark-hero-section">
        <img class="landmark-hero-image" src="${imageSrc}" alt="${landmarkNameZh}" 
             onerror="this.onerror=null; this.src='pic/placeholder.jpg'; console.warn('地標圖片載入失敗，已使用預設圖片');">
        <div class="landmark-hero-overlay">
            <h1 class="landmark-hero-name-zh">${landmarkNameZh}</h1>
            <p class="landmark-hero-name-en">${landmarkNameEn}</p>
        </div>
    </div>
    
    <div class="landmark-details-section">
        <div class="landmark-section">
            <h3 id="descTitle">${t.descTitle}</h3>
            <div class="landmark-description">
                <p id="landmarkDesc">${landmarkDesc}</p>
            </div>
        </div>

        <div class="landmark-section">
            <div class="nearby-header-centered">
                <h3 id="nearbyTitle">${t.nearbyTitle}</h3>
                <button class="filter-btn" id="filterBtn" onclick="openFilterModal()">
                    <span class="filter-icon">🔽</span>
                    <span>${currentLanguage === 'zh' ? '僅景點' : 'Spots Only'}</span>
                </button>
            </div>
            
            <div class="distance-filter-container">
                <div class="distance-filter-header">
                    <span class="distance-filter-label" id="distanceFilterLabel">${t.distanceFilterLabel}</span>
                    <span class="distance-display" id="distanceDisplay">2.0km</span>
                </div>
                <div class="distance-slider-container">
                    <input type="range" id="distanceSlider" min="0.5" max="5.0" step="0.1" value="2.0" class="distance-slider">
                    <div class="distance-marks">
                        <span>0.5km</span>
                        <span>2.0km</span>
                        <span>5.0km</span>
                    </div>
                </div>
                <div class="walking-info" id="walkingInfo">
                    <span class="walking-time">${t.walkingTime}: ${t.about}25${t.minutes}</span>
                    <span class="walking-distance">${t.walkingSteps}: ${t.about}2500${t.steps}</span>
                </div>
            </div>
            
            <div id="landmarkNearby">
                <!-- 附近地點列表將在這裡動態生成 -->
            </div>
        </div>

        <!-- 篩選彈出框 -->
        <div class="filter-modal-overlay" id="filterModalOverlay" onclick="closeFilterModal()">
            <div class="filter-modal" onclick="event.stopPropagation()">
                <div class="filter-modal-header">
                    <h4>${currentLanguage === 'zh' ? '選擇類型' : 'Select Type'}</h4>
                    <button class="close-btn" onclick="closeFilterModal()">✕</button>
                </div>
                <div class="filter-modal-content" id="filterModalContent">
                    <!-- 動態生成篩選選項 -->
                </div>
                <div class="filter-modal-footer">
                    <button class="button apply-filter-btn" onclick="applyFilter()">${currentLanguage === 'zh' ? '套用篩選' : 'Apply Filter'}</button>
                </div>
            </div>
        </div>
    </div>
    
    <div class="back-button-container">
        <button class="button" onclick="goToPage('recognitionScreen')">${t.backButton}</button>
    </div>
`;

    // 生成附近地點內容
    updateNearbyPlaces(data);
    initializeDistanceFilter();
    initializeTypeSelector(data);
}



// 同時需要修正 detect 函數中清空元素的部分
function detect(e) {
    if (e) {
        e.preventDefault();
    }

    const fileInput = document.getElementById('fileInput');
    const cameraInput = document.getElementById('cameraInput');

    if (!fileInput || !cameraInput) {
        alert('找不到輸入元素');
        return;
    }

    // 檢查哪個輸入有檔案
    let selectedFile = null;
    if (fileInput.files[0]) {
        selectedFile = fileInput.files[0];
    } else if (cameraInput.files[0]) {
        selectedFile = cameraInput.files[0];
    }

    if (!selectedFile) {
        const errorMessage = translations[currentLanguage].selectImagePrompt;
        const errorTitle = translations[currentLanguage].selectImageTitle;
        showNotification(errorMessage, errorTitle);
        return;
    }

    const formData = new FormData();
    formData.append('image', selectedFile);


    // 清空之前的結果 - 修改為清空整個容器
    const landmarkContainer = document.querySelector('#landmarkScreen .landmark-container');
    if (landmarkContainer) {
        landmarkContainer.innerHTML = '';
    }

    // 顯示載入動畫
    const loaderContainer = document.getElementById('loaderContainer');
    loaderContainer.classList.add('active');

    console.log('準備送出 fetch');
    fetch('https://driving-emerging-rhino.ngrok-free.app/detect', {
        method: 'POST',
        body: formData
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('伺服器回應錯誤: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            // 隱藏載入動畫
            loaderContainer.classList.remove('active');

            if (data.error || data.msg || !data.building) {
                // 顯示通知而不是切換頁面
                const errorMessage = translations[currentLanguage].recognitionFailed;
                const errorTitle = translations[currentLanguage].notificationTitle;
                showNotification(errorMessage, errorTitle);
                return;
            }

            if (data.building) {
                // 儲存當前地標資料
                currentLandmarkData = data;

                // 使用新函數更新地標內容
                updateLandmarkContent(data);

                // 跳轉到地標詳情頁面（這裡會自動顯示捲動按鈕）
                goToPage('landmarkScreen');

                // 確保初始化後預設只顯示景點
                setTimeout(() => {
                    console.log('確保預設只顯示景點');
                    selectedFilterTypes.clear();
                    filterByMultipleTypes();
                    updateFilterButtonText();
                }, 100);
            }
            else {
                currentLandmarkData = null;
                // 顯示無資料的頁面
                const landmarkContainer = document.querySelector('#landmarkScreen .landmark-container');
                if (landmarkContainer) {
                    landmarkContainer.innerHTML = `
                        <div class="landmark-details-section">
                            <div class="landmark-section">
                                <h3>${translations[currentLanguage].noInfo}</h3>
                            </div>
                        </div>
                        <div class="back-button-container">
                            <button class="button" onclick="goToPage('recognitionScreen')">${translations[currentLanguage].backButton}</button>
                        </div>
                    `;
                }
                goToPage('landmarkScreen');
            }
        })
        .catch(err => {
            // 隱藏載入動畫
            loaderContainer.classList.remove('active');

            console.error('fetch error:', err);
            // 顯示通知而不是顯示錯誤訊息和切換頁面
            const errorMessage = translations[currentLanguage].recognitionFailed;
            const errorTitle = translations[currentLanguage].notificationTitle;
            showNotification(errorMessage, errorTitle);
        });
}

function showNotification(message, title) {
    alert(`${title}\n\n${message}`);
}

// 新增切換附近地點展開/收合的函數
function toggleNearbyPlace(index) {
    const element = document.getElementById(`nearby-${index}`);
    if (element) {
        element.classList.toggle('active');
    }
}
function generateGoogleMapsLink(place, placeName) {
    // 優先使用經緯度，因為更精確
    if (place.lat && place.lng) {
        // 使用經緯度座標
        return `https://www.google.com/maps?q=${place.lat},${place.lng}`;
    } else if (place.address) {
        // 使用地址搜尋
        return `https://www.google.com/maps/search/${encodeURIComponent(place.address)}`;
    } else if (placeName) {
        // 使用地點名稱搜尋
        return `https://www.google.com/maps/search/${encodeURIComponent(placeName)}`;
    } else {
        // 預設搜尋台北
        return `https://www.google.com/maps/search/台北`;
    }
}

// 新增開啟 Google Maps 的函數
function openGoogleMaps(url) {
    // 在新視窗中開啟 Google Maps
    window.open(url, '_blank');
}

// 頁面載入時自動讀取語言
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM 載入完成，開始初始化...');

    // 先設置語言
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && (savedLang === 'zh' || savedLang === 'en')) {
        currentLanguage = savedLang;
    } else {
        currentLanguage = 'zh';
    }

    // 等待一下再初始化，確保所有元素都載入完成
    setTimeout(() => {
        // 初始化語言下拉選單
        initializeLanguageDropdown();

        // 應用語言設置
        switchLanguage(currentLanguage);

        // 修正：延遲綁定外部點擊事件，避免與上傳按鈕衝突
        setTimeout(() => {
            document.addEventListener('click', function (e) {
                const uploadContainer = document.querySelector('.upload-button-container');
                const uploadOptions = document.getElementById('uploadOptions');

                if (uploadContainer && uploadOptions) {
                    // 檢查點擊是否在上傳容器外部
                    if (!uploadContainer.contains(e.target)) {
                        // 檢查選單是否正在顯示
                        if (uploadOptions.classList.contains('show')) {
                            console.log('外部點擊，隱藏上傳選單');
                            hideUploadOptions();
                        }
                    }
                }
            });
        }, 500); // 延遲 500ms 綁定外部點擊事件

        console.log('所有初始化完成');
    }, 100);
});
// 語言下拉選單相關函數
function showDropdown() {
    const dropdown = document.getElementById('languageDropdown');
    if (dropdown) {
        dropdown.style.display = 'block';
        clearTimeout(window._langDropdownTimer);
    }
}

function hideDropdownDelayed() {
    window._langDropdownTimer = setTimeout(() => {
        const dropdown = document.getElementById('languageDropdown');
        if (dropdown) {
            dropdown.style.display = 'none';
        }
    }, 200);
}

function setLanguage(lang) {
    switchLanguage(lang);
}

// 修正 initializeLanguageDropdown 函數，移除重複的事件綁定
function initializeLanguageDropdown() {
    const languageBtn = document.getElementById('languageBtn');
    const languageDropdown = document.getElementById('languageDropdown');

    console.log('初始化語言下拉選單...');
    console.log('語言按鈕:', languageBtn);
    console.log('語言下拉選單:', languageDropdown);

    if (!languageBtn) {
        console.error('找不到語言按鈕 #languageBtn');
        return;
    }

    if (!languageDropdown) {
        console.error('找不到語言下拉選單 #languageDropdown');
        return;
    }

    // 確保下拉選單有正確的類別
    if (!languageDropdown.classList.contains('dropdown-menu')) {
        languageDropdown.classList.add('dropdown-menu');
    }

    // 移除舊的事件監聽器（如果有的話）
    languageBtn.replaceWith(languageBtn.cloneNode(true));
    const newLanguageBtn = document.getElementById('languageBtn');

    // 點擊語言按鈕切換下拉選單
    newLanguageBtn.addEventListener('click', function (e) {
        console.log('語言按鈕被點擊');
        e.stopPropagation();

        const isVisible = languageDropdown.classList.contains('show');
        console.log('當前顯示狀態:', isVisible);

        // 添加詳細的調試信息
        console.log('下拉選單當前樣式:', {
            display: window.getComputedStyle(languageDropdown).display,
            classes: languageDropdown.className,
            position: window.getComputedStyle(languageDropdown).position,
            zIndex: window.getComputedStyle(languageDropdown).zIndex
        });

        if (isVisible) {
            languageDropdown.classList.remove('show');
            newLanguageBtn.classList.remove('active');
            console.log('隱藏下拉選單');
        } else {
            languageDropdown.classList.add('show');
            newLanguageBtn.classList.add('active');

            // 強制設置樣式以確保顯示
            languageDropdown.style.display = 'block';
            languageDropdown.style.visibility = 'visible';
            languageDropdown.style.opacity = '1';

            console.log('顯示下拉選單');
            console.log('顯示後的樣式:', {
                display: window.getComputedStyle(languageDropdown).display,
                visibility: window.getComputedStyle(languageDropdown).visibility,
                opacity: window.getComputedStyle(languageDropdown).opacity
            });
        }
    });

    // 點擊語言選項
    const langOptions = languageDropdown.querySelectorAll('.lang-option');
    console.log('找到語言選項:', langOptions.length);

    langOptions.forEach((option, index) => {
        option.addEventListener('click', function (e) {
            console.log(`語言選項 ${index} 被點擊:`, this.getAttribute('data-lang'));
            e.stopPropagation();

            const selectedLang = this.getAttribute('data-lang');

            // 更新當前語言
            switchLanguage(selectedLang);

            // 更新選中狀態
            langOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');

            // 隱藏下拉選單
            languageDropdown.classList.remove('show');
            languageDropdown.style.display = 'none';
            newLanguageBtn.classList.remove('active');
        });
    });

    // 點擊其他地方隱藏下拉選單
    document.addEventListener('click', function (e) {
        if (!newLanguageBtn.contains(e.target) && !languageDropdown.contains(e.target)) {
            if (languageDropdown.classList.contains('show')) {
                languageDropdown.classList.remove('show');
                languageDropdown.style.display = 'none';
                newLanguageBtn.classList.remove('active');
                console.log('點擊外部，隱藏下拉選單');
            }
        }
    });

    // 初始化時設置當前語言選項為活躍狀態
    updateLanguageSelection();
    console.log('語言下拉選單初始化完成');
}

function updateLanguageSelection() {
    const langOptions = document.querySelectorAll('.lang-option');
    langOptions.forEach(option => {
        const optionLang = option.getAttribute('data-lang');
        if (optionLang === currentLanguage) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
}

function toggleUploadOptions(event) {
    if (event) {
        event.stopPropagation(); // 阻止事件冒泡
        event.preventDefault(); // 阻止預設行為
    }

    console.log('toggleUploadOptions called');
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadOptions = document.getElementById('uploadOptions');

    if (!uploadOptions || !uploadBtn) {
        console.error('Upload elements not found');
        return;
    }

    const isVisible = uploadOptions.classList.contains('show');

    if (isVisible) {
        hideUploadOptions();
    } else {
        showUploadOptions();
    }
}

// 顯示上傳選項
function showUploadOptions() {
    console.log('showUploadOptions called');
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadOptions = document.getElementById('uploadOptions');

    if (uploadOptions && uploadBtn) {
        uploadOptions.classList.add('show');
        uploadBtn.classList.add('active');
        console.log('Upload options shown');
    }
}

// 修正隱藏函數
function hideUploadOptions() {
    console.log('hideUploadOptions called');
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadOptions = document.getElementById('uploadOptions');

    if (uploadOptions && uploadBtn) {
        uploadOptions.classList.remove('show');
        uploadBtn.classList.remove('active');
        console.log('Upload options hidden');
    }
}

// 選擇拍照
function selectCamera(event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    console.log('selectCamera called');
    const cameraInput = document.getElementById('cameraInput');
    if (cameraInput) {
        cameraInput.click();
    }
    hideUploadOptions();
}

function selectFile(event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    console.log('selectFile called');
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.click();
    }
    hideUploadOptions();
}


// 預覽上傳的照片
function previewPhoto(event) {
    const input = event.target;
    const previewContainer = document.getElementById('previewContainer');
    const photoPreview = document.getElementById('photoPreview');

    if (input.files && input.files[0]) {
        const reader = new FileReader();

        reader.onload = function (e) {
            photoPreview.src = e.target.result;
            previewContainer.classList.remove('hidden');

            // 清空另一個輸入框
            const fileInput = document.getElementById('fileInput');
            const cameraInput = document.getElementById('cameraInput');

            if (input.id === 'fileInput' && cameraInput) {
                cameraInput.value = '';
            } else if (input.id === 'cameraInput' && fileInput) {
                fileInput.value = '';
            }
        };

        reader.readAsDataURL(input.files[0]);
    } else {
        photoPreview.src = '';
        previewContainer.classList.add('hidden');
    }
}

// 隱藏捲動按鈕
function hideScrollButtons() {
    const scrollButtons = document.querySelector('.fixed-scroll-buttons');
    if (scrollButtons) {
        scrollButtons.classList.remove('show');
    }
}

// 顯示捲動按鈕
function showScrollButtons() {
    const scrollButtons = document.querySelector('.fixed-scroll-buttons');
    if (scrollButtons) {
        scrollButtons.classList.add('show');
    }
}

// 新增缺少的捲動函數
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function scrollToBottom() {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
    });
}

function initializeDistanceFilter() {
    const distanceSlider = document.getElementById('distanceSlider');
    const filterContainer = document.querySelector('.distance-filter-container');

    if (!distanceSlider) return;

    // 移除可能的舊事件監聽器
    distanceSlider.replaceWith(distanceSlider.cloneNode(true));
    const newDistanceSlider = document.getElementById('distanceSlider');

    let isSliding = false;
    let slideTimeout;

    // 開始滑動時
    function startSliding() {
        isSliding = true;
        if (filterContainer) {
            filterContainer.classList.add('sliding');
        }
    }

    // 結束滑動時
    function endSliding() {
        isSliding = false;
        if (filterContainer) {
            filterContainer.classList.remove('sliding');
        }
        if (slideTimeout) {
            clearTimeout(slideTimeout);
        }
        filterByDistance(newDistanceSlider.value);
    }

    // 重新綁定事件
    newDistanceSlider.addEventListener('mousedown', startSliding);
    newDistanceSlider.addEventListener('touchstart', startSliding);

    newDistanceSlider.addEventListener('input', function () {
        updateDistanceDisplay(this.value);

        if (slideTimeout) {
            clearTimeout(slideTimeout);
        }

        if (isSliding) {
            slideTimeout = setTimeout(() => {
                if (!isSliding) {
                    filterByDistance(this.value);
                }
            }, 500);
        }
    });

    newDistanceSlider.addEventListener('mouseup', endSliding);
    newDistanceSlider.addEventListener('touchend', endSliding);

    document.addEventListener('mouseup', function () {
        if (isSliding) {
            endSliding();
        }
    });

    newDistanceSlider.addEventListener('keyup', function () {
        updateDistanceDisplay(this.value);
        filterByDistance(this.value);
    });

    // 初始化顯示
    updateDistanceDisplay(newDistanceSlider.value);
}

// 更新距離顯示和步行資訊
function updateDistanceDisplay(distance) {
    const t = translations[currentLanguage];
    const distanceDisplay = document.getElementById('distanceDisplay');
    const walkingInfo = document.getElementById('walkingInfo');

    // 同時更新距離篩選標籤
    const distanceFilterLabel = document.getElementById('distanceFilterLabel');
    if (distanceFilterLabel) {
        distanceFilterLabel.textContent = t.distanceFilterLabel;
    }

    if (distanceDisplay) {
        distanceDisplay.textContent = `${distance}km`;
    }

    if (walkingInfo) {
        const walkingTime = calculateWalkingTime(distance);
        const walkingSteps = calculateWalkingSteps(distance);

        // 修復：使用翻譯中的「約」字
        const aboutText = currentLanguage === 'zh' ? '約' : 'About ';

        walkingInfo.innerHTML = `
            <span class="walking-time">${t.walkingTime}: ${aboutText}${walkingTime}${t.minutes}</span>
            <span class="walking-distance">${t.walkingSteps}: ${aboutText}${walkingSteps}${t.steps}</span>
        `;
    }
}

// 計算步行時間（假設平均步行速度 5km/h）
function calculateWalkingTime(distance) {
    const walkingSpeedKmPerHour = 5;
    const timeInHours = parseFloat(distance) / walkingSpeedKmPerHour;
    const timeInMinutes = Math.round(timeInHours * 60);
    return timeInMinutes;
}

// 計算步行步數（假設每公里約1250步）
function calculateWalkingSteps(distance) {
    const stepsPerKm = 1250;
    const totalSteps = Math.round(parseFloat(distance) * stepsPerKm);
    return totalSteps.toLocaleString();
}

// 根據距離篩選附近地點
function filterByDistance(maxDistance) {
    // 使用新的複選篩選邏輯
    filterByMultipleTypes();
}

// 修改 updateNearbyPlaces 函數，為每個項目添加 data-type 屬性
function updateNearbyPlaces(data) {
    const t = translations[currentLanguage];
    let nearbyHTML = '';

    if (data.nearby_places && Array.isArray(data.nearby_places)) {
        if (data.nearby_places.length === 0) {
            nearbyHTML = `<p>${t.noData}</p>`;
        } else {
            data.nearby_places.forEach((p, index) => {
                // Debug: 列印每個地點的完整資料結構
                console.log(`=== Place ${index} ===`);
                console.log('Complete place data:', p);
                console.log('type:', p.type);
                console.log('eng_type:', p.eng_type);

                // 判斷是否為地標（buildings table 的資料）
                const isLandmark = p.is_building === true;
                console.log(`地點 ${index}: ${p.name}, is_building: ${p.is_building}, isLandmark: ${isLandmark}`);
                const itemClass = isLandmark ? 'landmark-item' : 'place-item';

                // 修改建築類型邏輯：優先使用資料中的 eng_type
                let buildingType;
                let displayType;

                if (p.type) {
                    // 根據當前語言選擇顯示的類型
                    if (currentLanguage === 'zh') {
                        displayType = p.type; // 中文直接使用原始類型
                    } else {
                        // 英文優先使用 eng_type，如果沒有則使用預設翻譯
                        if (p.eng_type && p.eng_type.trim() !== '') {
                            displayType = p.eng_type;
                        } else {
                            // 如果沒有 eng_type，使用預設翻譯
                            if (p.type === '知名景點') {
                                displayType = 'Famous Spot';
                            } else if (p.type === '夜市') {
                                displayType = 'Night Market';
                            } else if (p.type === '食物' || p.type === '美食') {
                                displayType = 'Food';
                            } else if (p.type === '寺廟') {
                                displayType = 'Temple';
                            } else if (p.type === '公園') {
                                displayType = 'Park';
                            } else if (p.type === '博物館') {
                                displayType = 'Museum';
                            } else if (p.type === '車站') {
                                displayType = 'Station';
                            } else if (p.type === '學校') {
                                displayType = 'School';
                            } else {
                                displayType = p.type; // 保持原樣
                            }
                        }
                    }

                    // 建築類型用於篩選（統一歸類）
                    if (p.type === '知名景點' || (p.eng_type && p.eng_type.toLowerCase().includes('famous'))) {
                        buildingType = currentLanguage === 'zh' ? '景點' : 'Spot';
                    }
                    else if (p.type === '夜市' || (p.eng_type && p.eng_type.toLowerCase().includes('night market'))) {
                        buildingType = currentLanguage === 'zh' ? '美食' : 'Food';
                    }
                    else if (p.type === '食物' || p.type === '美食' || (p.eng_type && p.eng_type.toLowerCase().includes('food'))) {
                        buildingType = currentLanguage === 'zh' ? '美食' : 'Food';
                    }
                    else if (p.type === '寺廟' || (p.eng_type && p.eng_type.toLowerCase().includes('temple'))) {
                        buildingType = currentLanguage === 'zh' ? '寺廟' : 'Temple';
                    }
                    else if (p.type === '公園' || (p.eng_type && p.eng_type.toLowerCase().includes('park'))) {
                        buildingType = currentLanguage === 'zh' ? '公園' : 'Park';
                    }
                    else if (p.type === '博物館' || (p.eng_type && p.eng_type.toLowerCase().includes('museum'))) {
                        buildingType = currentLanguage === 'zh' ? '博物館' : 'Museum';
                    }
                    else if (p.type === '車站' || (p.eng_type && p.eng_type.toLowerCase().includes('station'))) {
                        buildingType = currentLanguage === 'zh' ? '車站' : 'Station';
                    }
                    else if (p.type === '學校' || (p.eng_type && p.eng_type.toLowerCase().includes('school'))) {
                        buildingType = currentLanguage === 'zh' ? '學校' : 'School';
                    }
                    else {
                        // 如果是其他類型，使用對應的語言版本
                        if (currentLanguage === 'zh') {
                            buildingType = p.type;
                        } else {
                            buildingType = p.eng_type || p.type;
                        }
                    }
                } else {
                    displayType = currentLanguage === 'zh' ? '未分類' : 'Uncategorized';
                    buildingType = currentLanguage === 'zh' ? '未分類' : 'Uncategorized';
                }

                // 使用當前語言來決定顯示的名稱和地址
                const placeName = currentLanguage === 'zh' ?
                    p.name :
                    (p.eng_name || p.name);

                const placeAddress = currentLanguage === 'zh' ?
                    p.address :
                    (p.eng_address || p.address);

                // 根據不同資料表選擇正確的描述欄位
                let placeInfo = '';
                if (isLandmark) {
                    placeInfo = currentLanguage === 'zh' ?
                        (p.desc || p.data || p.dis || t.noDesc) :
                        (p.en_desc || p.eng_data || p.eng_dis || p.desc || p.data || p.dis || t.noDesc);
                } else {
                    placeInfo = currentLanguage === 'zh' ?
                        (p.info || p.dis || t.noDesc) :
                        (p.eng_info || p.eng_dis || p.info || p.dis || t.noDesc);
                }

                // 構建地點名稱和類型的顯示
                let displayTitle;
                if (isLandmark) {
                    const landmarkBadge = currentLanguage === 'zh' ? '地標' : 'Landmark';
                    displayTitle = `${placeName} <span class="landmark-badge">${landmarkBadge}</span>`;
                } else {
                    displayTitle = `${placeName} <span class="place-badge">${displayType}</span>`;
                }

                // 生成 Google Maps 連結
                const mapsLink = generateGoogleMapsLink(p, placeName);

                // 構建 HTML
                nearbyHTML += `
<div class="nearby-place ${itemClass}" id="nearby-${index}" data-type="${buildingType}">
    <div class="nearby-header" onclick="toggleNearbyPlace(${index})">
        <h4>${displayTitle} - ${p.distance.toFixed(2)}km</h4>
        <div class="nearby-toggle"></div>
    </div>
    <div class="nearby-content">
        <div class="building-type-tag-small" data-type="${displayType}">${displayType}</div>
        ${placeAddress ? `
            <p>
                <strong>${currentLanguage === 'zh' ? '地址' : 'Address'}：</strong>
                <span class="address-link" onclick="openGoogleMaps('${mapsLink}')" title="${currentLanguage === 'zh' ? '點擊在 Google Maps 中查看' : 'Click to view in Google Maps'}">
                    ${placeAddress} 📍
                </span>
            </p>
        ` : ''}
        ${placeInfo && placeInfo !== t.noDesc && placeInfo.trim() !== '' ? `<p>${placeInfo}</p>` : `<p><em>${t.noDesc}</em></p>`}
    </div>
</div>`;
            });
        }
    } else {
        nearbyHTML = `<p>${t.noData}</p>`;
    }

    // 更新附近地點內容
    const nearbyContainer = document.getElementById('landmarkNearby');
    if (nearbyContainer) {
        nearbyContainer.innerHTML = nearbyHTML;
    }
}


// 修改初始化類型選擇器函數
function initializeTypeSelector(data) {
    if (!data.nearby_places || !Array.isArray(data.nearby_places)) return;

    console.log('=== 初始化類型選擇器 ===');
    console.log('當前語言:', currentLanguage);
    console.log('當前篩選狀態:', Array.from(selectedFilterTypes));

    // 收集所有建築類型
    const buildingTypes = new Set();
    data.nearby_places.forEach(place => {
        if (place.type && place.type.trim() !== '') {
            let typeToAdd;

            // 根據當前語言決定要收集的類型
            if (currentLanguage === 'zh') {
                typeToAdd = place.type;
            } else {
                // 英文優先使用 eng_type
                if (place.eng_type && place.eng_type.trim() !== '') {
                    typeToAdd = place.eng_type;
                } else {
                    // 如果沒有 eng_type，使用預設翻譯
                    if (place.type === '知名景點') {
                        typeToAdd = 'Famous Spot';
                    } else if (place.type === '夜市') {
                        typeToAdd = 'Night Market';
                    } else if (place.type === '食物' || place.type === '美食') {
                        typeToAdd = 'Food';
                    } else if (place.type === '寺廟') {
                        typeToAdd = 'Temple';
                    } else if (place.type === '公園') {
                        typeToAdd = 'Park';
                    } else if (place.type === '博物館') {
                        typeToAdd = 'Museum';
                    } else if (place.type === '車站') {
                        typeToAdd = 'Station';
                    } else if (place.type === '學校') {
                        typeToAdd = 'School';
                    } else {
                        typeToAdd = place.type;
                    }
                }
            }

            // 統一歸類用於篩選
            if (place.type === '知名景點' || (place.eng_type && place.eng_type.toLowerCase().includes('famous'))) {
                const spotType = currentLanguage === 'zh' ? '景點' : 'Spot';
                buildingTypes.add(spotType);
            }
            else if (place.type === '夜市' || (place.eng_type && place.eng_type.toLowerCase().includes('night market'))) {
                const foodType = currentLanguage === 'zh' ? '美食' : 'Food';
                buildingTypes.add(foodType);
            }
            else if (place.type === '食物' || place.type === '美食' || (place.eng_type && place.eng_type.toLowerCase().includes('food'))) {
                const foodType = currentLanguage === 'zh' ? '美食' : 'Food';
                buildingTypes.add(foodType);
            }
            else {
                buildingTypes.add(typeToAdd);
            }
        }
    });

    // 儲存可用類型
    availableTypes = Array.from(buildingTypes).sort();

    // **關鍵修復：不要在這裡清空 selectedFilterTypes**
    // **只有在首次初始化時才設定為預設狀態**
    const isFirstTimeInit = !currentLandmarkData || availableTypes.length === 0;

    if (isFirstTimeInit) {
        console.log('首次初始化：設定為預設狀態（僅景點）');
        selectedFilterTypes.clear();
    } else {
        console.log('語言切換：維持現有篩選狀態');
        // 不清空 selectedFilterTypes，保持現有狀態
    }

    console.log('收集到的建築類型:', availableTypes);
    console.log('最終篩選狀態:', Array.from(selectedFilterTypes));
    console.log('========================');
}

// 切換類型下拉選單
function toggleTypeDropdown() {
    const typeSelectorBtn = document.getElementById('typeSelectorBtn');
    const typeSelectorDropdown = document.getElementById('typeSelectorDropdown');

    if (typeSelectorDropdown.style.display === 'block') {
        closeTypeDropdown();
    } else {
        typeSelectorBtn.classList.add('active');
        typeSelectorDropdown.style.display = 'block';
    }
}

// 關閉類型下拉選單
function closeTypeDropdown() {
    const typeSelectorBtn = document.getElementById('typeSelectorBtn');
    const typeSelectorDropdown = document.getElementById('typeSelectorDropdown');

    typeSelectorBtn.classList.remove('active');
    typeSelectorDropdown.style.display = 'none';
}

// 選擇類型選項
function selectTypeOption(option) {
    const selectedTypeText = document.getElementById('selectedTypeText');
    const allOptions = document.querySelectorAll('.type-option');

    // 移除所有選中狀態
    allOptions.forEach(opt => opt.classList.remove('selected'));

    // 設置新的選中狀態
    option.classList.add('selected');
    selectedTypeText.textContent = option.textContent;

    // 執行篩選
    const selectedType = option.getAttribute('data-type');
    filterByTypeSelection(selectedType);

    // 關閉下拉選單
    closeTypeDropdown();
}

// 根據類型選擇進行篩選
function filterByTypeSelection(selectedType) {
    const distanceSlider = document.getElementById('distanceSlider');
    const maxDistance = distanceSlider ? parseFloat(distanceSlider.value) : 5.0;

    const allItems = document.querySelectorAll('.nearby-place');

    allItems.forEach(item => {
        // 檢查距離
        const headerText = item.querySelector('.nearby-header h4').textContent;
        const distanceMatch = headerText.match(/(\d+\.?\d*)km/);
        const itemDistance = distanceMatch ? parseFloat(distanceMatch[1]) : 0;

        // 檢查是否為地標
        const isLandmark = item.classList.contains('landmark-item');

        // 檢查建築類型
        const itemType = item.getAttribute('data-type');

        // 判斷是否符合篩選條件
        const distanceMatches = itemDistance <= maxDistance;

        let typeMatches = false;
        if (selectedType === 'spots-only') {
            // 僅景點：不顯示地標
            typeMatches = !isLandmark;
        } else if (selectedType === 'all') {
            // 所有地點：顯示所有
            typeMatches = true;
        } else {
            // 特定類型：匹配建築類型
            typeMatches = itemType === selectedType;
        }

        if (distanceMatches && typeMatches) {
            // 顯示項目
            item.style.display = 'block';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        } else {
            // 隱藏項目
            item.style.opacity = '0';
            item.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                if (item.style.opacity === '0') {
                    item.style.display = 'none';
                }
            }, 300);
        }
    });
}

// 開啟篩選彈出框
function openFilterModal() {
    const filterModalOverlay = document.getElementById('filterModalOverlay');
    const filterModalContent = document.getElementById('filterModalContent');

    if (!filterModalOverlay || !filterModalContent) {
        console.error('Modal elements not found');
        return;
    }

    // 生成複選篩選選項
    let optionsHTML = '';

    // 如果有建築類型，添加建築類型選項
    if (availableTypes.length > 0) {
        optionsHTML += `
            <div class="filter-section">
                <h5 class="filter-section-title">${currentLanguage === 'zh' ? '建築類型' : 'Building Types'}</h5>
        `;

        availableTypes.forEach((type, index) => {
            optionsHTML += `
                <div class="filter-option">
                    <input type="checkbox" id="filter-type-${index}" value="${type}" ${selectedFilterTypes.has(type) ? 'checked' : ''}>
                    <label for="filter-type-${index}">${type}</label>
                </div>
            `;
        });

        optionsHTML += `</div>`;
    } else {
        // 如果沒有建築類型，顯示提示
        optionsHTML = `
            <div class="filter-section">
                <p style="text-align: center; color: #666; font-style: italic;">
                    ${currentLanguage === 'zh' ? '暫無可篩選的建築類型' : 'No building types available for filtering'}
                </p>
            </div>
        `;
    }

    filterModalContent.innerHTML = optionsHTML;
    filterModalOverlay.style.display = 'flex';

    // 添加淡入效果
    setTimeout(() => {
        filterModalOverlay.style.opacity = '1';
    }, 10);
}


// 關閉篩選彈出框
function closeFilterModal() {
    const filterModalOverlay = document.getElementById('filterModalOverlay');
    if (filterModalOverlay) {
        filterModalOverlay.style.opacity = '0';
        setTimeout(() => {
            filterModalOverlay.style.display = 'none';
        }, 300);
    }
}

// 套用篩選
function applyFilter() {
    const checkboxes = document.querySelectorAll('#filterModalContent input[type="checkbox"]:checked');

    // 清空當前選擇
    selectedFilterTypes.clear();

    // 收集所有選中的篩選
    checkboxes.forEach(checkbox => {
        selectedFilterTypes.add(checkbox.value);
    });
    // 執行篩選
    filterByMultipleTypes();

    // 更新篩選按鈕顯示
    updateFilterButtonText();

    closeFilterModal();
}

// 更新篩選按鈕文字
function updateFilterButtonText() {
    const filterBtn = document.getElementById('filterBtn');

    if (!filterBtn) return;

    let displayText = '';
    const selectedCount = selectedFilterTypes.size;

    if (selectedCount === 0) {
        displayText = currentLanguage === 'zh' ? '僅景點' : 'Spots Only';
        console.log('篩選按鈕文字：僅景點模式');
    } else if (selectedCount === 1) {
        const singleType = Array.from(selectedFilterTypes)[0];
        displayText = singleType;
        console.log('篩選按鈕文字：單一類型 -', singleType);
    } else {
        displayText = currentLanguage === 'zh' ? `已選擇 ${selectedCount} 項` : `${selectedCount} Selected`;
        console.log('篩選按鈕文字：多項選擇 -', selectedCount);
    }

    filterBtn.innerHTML = `
        <span class="filter-icon">🔽</span>
        <span>${displayText}</span>
    `;
}


function updateNearbyPlacesLanguage() {
    // 這個函數用於更新附近地點的語言顯示
    if (currentLandmarkData && currentLandmarkData.nearby_places) {
        updateNearbyPlaces(currentLandmarkData);
    }
}


function filterByMultipleTypes() {
    const distanceSlider = document.getElementById('distanceSlider');
    const maxDistance = distanceSlider ? parseFloat(distanceSlider.value) : 5.0;
    const allItems = document.querySelectorAll('.nearby-place');

    console.log('=== 執行篩選 ===');
    console.log('當前語言:', currentLanguage);
    console.log('選中的篩選類型:', Array.from(selectedFilterTypes));
    console.log('篩選模式:', selectedFilterTypes.size === 0 ? '預設（只顯示景點）' : '自定義篩選');
    console.log('最大距離:', maxDistance + 'km');
    console.log('總項目數:', allItems.length);

    let visibleCount = 0;
    let landmarkCount = 0;
    let hiddenLandmarkCount = 0;

    allItems.forEach((item, index) => {
        // 檢查距離
        const headerText = item.querySelector('.nearby-header h4').textContent;
        const distanceMatch = headerText.match(/(\d+\.?\d*)km/);
        const itemDistance = distanceMatch ? parseFloat(distanceMatch[1]) : 0;

        // 檢查是否為地標
        const isLandmark = item.classList.contains('landmark-item');
        if (isLandmark) landmarkCount++;

        // 檢查建築類型
        const itemType = item.getAttribute('data-type');

        // 判斷是否符合距離條件
        const distanceMatches = itemDistance <= maxDistance;

        // 判斷是否符合類型條件
        let typeMatches = false;

        if (selectedFilterTypes.size === 0) {
            // 預設狀態：只顯示非地標項目（景點）
            typeMatches = !isLandmark;
            if (isLandmark) {
                console.log(`隱藏地標 ${index}: ${headerText} (預設模式)`);
                hiddenLandmarkCount++;
            }
        } else {
            // 有選擇篩選條件
            if (isLandmark) {
                // 對於地標項目：如果有任何篩選條件被選中，就顯示地標
                typeMatches = true;
                console.log(`顯示地標 ${index}: ${headerText} (用戶選擇了篩選條件)`);
            } else {
                // 對於非地標項目：檢查是否符合選中的篩選條件
                typeMatches = selectedFilterTypes.has(itemType);
                console.log(`非地標項目 ${index}: ${headerText}, 類型: ${itemType}, 符合篩選: ${typeMatches}`);
            }
        }

        const shouldShow = distanceMatches && typeMatches;
        console.log(`項目 ${index}: 距離符合: ${distanceMatches}, 類型符合: ${typeMatches}, 最終顯示: ${shouldShow}`);

        if (shouldShow) {
            // 顯示項目
            item.style.display = 'block';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
            visibleCount++;
        } else {
            // 隱藏項目
            item.style.opacity = '0';
            item.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                if (item.style.opacity === '0') {
                    item.style.display = 'none';
                }
            }, 300);
        }
    });

    console.log('篩選結果:');
    console.log('- 可見項目:', visibleCount);
    console.log('- 總地標數:', landmarkCount);
    console.log('- 隱藏的地標數:', hiddenLandmarkCount);
    console.log('================');
}