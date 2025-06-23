const API_BASE_URL = 'https://yolo-dect.onrender.com';

// 全域變數設定
let currentLanguage = 'zh'; // 預設為中文
let currentAttractionsData = null;
let currentDistrictKey = null; // 新增這行
// 語言資源
const languages = {
    zh: {
        title: '影像辨識玩台北',
        recognition: '辨識',
        map: '地圖',
        language: '語言',
        attractions: '景點',
        attractionsList: '景點列表',
        returnToMap: '返回地圖',
        address: '地址：',
        introduction: '介紹：',
        landmark: '地標',
        noLandmarkInfo: '此區域暫無地標資訊',
        loading: '載入中...',
        errorTitle: '載入錯誤',
        errorMessage: '抱歉，無法載入景點資料。',
        errorRetry: '請稍後再試或聯繫系統管理員。',
        landmarks: '地標',
        districts: {
            '北投區': '北投區',
            '士林區': '士林區',
            '內湖區': '內湖區',
            '中山區': '中山區',
            '松山區': '松山區',
            '大同區': '大同區',
            '萬華區': '萬華區',
            '中正區': '中正區',
            '大安區': '大安區',
            '信義區': '信義區',
            '南港區': '南港區',
            '文山區': '文山區'
        }
    },
    en: {
        title: 'Image Recognition Taipei Tour',
        recognition: 'Recognition',
        map: 'Map',
        language: 'Language',
        attractions: 'Attractions',
        attractionsList: 'Attractions List',
        returnToMap: 'Back to Map',
        address: 'Address: ',
        introduction: 'Introduction: ',
        landmark: 'Landmark',
        noLandmarkInfo: 'No landmark information available in this area',
        loading: 'Loading...',
        errorTitle: 'Loading Error',
        errorMessage: 'Sorry, unable to load attraction data.',
        errorRetry: 'Please try again later or contact the administrator.',
        landmarks: 'Landmarks',
        districts: {
            '北投區': 'Beitou District',
            '士林區': 'Shilin District',
            '內湖區': 'Neihu District',
            '中山區': 'Zhongshan District',
            '松山區': 'Songshan District',
            '大同區': 'Datong District',
            '萬華區': 'Wanhua District',
            '中正區': 'Zhongzheng District',
            '大安區': 'Da\'an District',
            '信義區': 'Xinyi District',
            '南港區': 'Nangang District',
            '文山區': 'Wenshan District'
        }
    }
};

let languageBtn;
let languageDropdown;
function showDropdown() {
    const rect = languageBtn.getBoundingClientRect();
    languageDropdown.style.display = 'block';
    languageDropdown.style.left = rect.left + 'px';
    languageDropdown.style.top = (rect.bottom + window.scrollY) + 'px';
}
function hideDropdownDelayed() {
    window._langDropdownTimer = setTimeout(() => {
        languageDropdown.style.display = 'none';
    }, 200);
}

// 公用函數
function getText(key, subKey = null) {
    if (subKey) {
        return languages[currentLanguage][key][subKey] || languages['zh'][key][subKey];
    }
    return languages[currentLanguage][key] || languages['zh'][key];
}
function setLanguage(lang) {
    // 直接設定語言，不使用 toggle
    currentLanguage = lang;
    // 儲存到 localStorage
    localStorage.setItem('preferredLanguage', currentLanguage);
    // 更新頁面語言
    updatePageLanguage();
    console.log('語言已設定為:', currentLanguage);
}

// 切換附近地點展開/收合
window.toggleNearbyPlace = function (index) {
    const element = document.getElementById(`attraction-${index}`);
    if (element) {
        element.classList.toggle('active');
    }
}

// 頁面切換功能
window.goToPage = function (pageId) {
    const mapContainer = document.querySelector('.map-container');
    const districtScreen = document.getElementById('districtScreen');

    if (pageId === 'mapContainer') {
        mapContainer.style.display = 'flex';
        districtScreen.classList.add('hidden');
    } else if (pageId === 'districtScreen') {
        mapContainer.style.display = 'none';
        districtScreen.classList.remove('hidden');
    }
}

// 開啟 Google Maps
window.openGoogleMaps = function (url) {
    if (url) {
        window.open(url, '_blank');
    }
}

// 顯示載入指示器
function showLoader() {
    document.getElementById('loaderContainer').classList.add('active');
}

// 隱藏載入指示器
function hideLoader() {
    document.getElementById('loaderContainer').classList.remove('active');
}

// 切換語言

function updatePageLanguage() {
    document.getElementById('header').textContent = getText('title');
    document.getElementById('recognitionBtn').textContent = getText('recognition');
    document.getElementById('mapBtn').textContent = getText('map');

    // 檢查 languageBtn 是否存在
    const langBtn = document.getElementById('languageBtn');
    if (langBtn) {
        langBtn.textContent = getText('language');
    }

    const attractionsListTitle = document.querySelector('.landmark-section h3');
    if (attractionsListTitle) {
        attractionsListTitle.textContent = getText('attractionsList');
    }

    const returnButtons = document.querySelectorAll('.button[onclick*="goToPage"]');
    returnButtons.forEach(button => {
        button.textContent = getText('returnToMap');
    });

    updateMapDistrictNames();

    // 只用 currentDistrictKey 來切換標題和內容
    const districtNameElement = document.getElementById('districtName');
    if (districtNameElement && currentDistrictKey) {
        const translatedDistrict = getText('districts', currentDistrictKey);
        districtNameElement.textContent = translatedDistrict + ' ' + getText('attractions');
        updateCurrentAttractionsLanguage();
    }
}



// 新增：更新當前景點列表的語言顯示
function updateCurrentAttractionsLanguage() {
    console.log("更新景點語言，當前語言:", currentLanguage);
    console.log("當前景點資料:", currentAttractionsData);

    // 如果有儲存的景點資料，重新渲染（只顯示地標）
    if (currentAttractionsData && currentAttractionsData.length > 0) {
        displayAttractions(currentAttractionsData);
    } else {
        // 沒有資料時顯示無地標訊息
        document.getElementById('districtAttractions').innerHTML = `
        <div class="no-data-item">
            <div class="nearby-header">
                <h4>${getText('noLandmarkInfo')}</h4>
            </div>
        </div>`;
    }
}
// 更新地標標籤
const landmarkBadges = document.querySelectorAll('.landmark-badge');
landmarkBadges.forEach(badge => {
    badge.textContent = getText('landmark');
});

// 更新地址標籤
const addressLabels = document.querySelectorAll('.attraction-detail .label');
addressLabels.forEach(label => {
    if (label.textContent.includes('地址') || label.textContent.includes('Address')) {
        label.textContent = getText('address');
    } else if (label.textContent.includes('介紹') || label.textContent.includes('Introduction')) {
        label.textContent = getText('introduction');
    }
});


function updateMapDistrictNames() {
    const texts = document.querySelectorAll('.taipei-map text');
    const textMappings = [
        { x: 95, y: 147, district: '北投區' },
        { x: 196, y: 179, district: '士林區' },
        { x: 268, y: 294, district: '內湖區' },
        { x: 163, y: 295, district: '中山區' },
        { x: 205, y: 335, district: '松山區', part: 1 },
        { x: 205, y: 350, district: '松山區', part: 2 },
        { x: 110, y: 310, district: '大同區', part: 1 },
        { x: 110, y: 329, district: '大同區', part: 2 },
        { x: 110, y: 348, district: '大同區', part: 3 },
        { x: 76, y: 390, district: '萬華區', part: 1 },
        { x: 76, y: 410, district: '萬華區', part: 2 },
        { x: 76, y: 430, district: '萬華區', part: 3 },
        { x: 125, y: 380, district: '中正區' },
        { x: 170, y: 401, district: '大安區' },
        { x: 227, y: 397, district: '信義區' },
        { x: 300, y: 387, district: '南港區' },
        { x: 235, y: 485, district: '文山區' }
    ];

    texts.forEach(text => {
        const x = parseFloat(text.getAttribute('x'));
        const y = parseFloat(text.getAttribute('y'));

        const mapping = textMappings.find(m =>
            Math.abs(m.x - x) < 5 && Math.abs(m.y - y) < 5
        );

        if (mapping) {
            if (currentLanguage === 'en') {
                text.setAttribute('font-size', '10');
                text.style.fontSize = '10px';

                if (mapping.part) {
                    if (mapping.part === 1) {
                        const simpleNames = {
                            '松山區': 'Songshan',
                            '大同區': 'Datong',
                            '萬華區': 'Wanhua'
                        };
                        text.textContent = simpleNames[mapping.district];
                    } else {
                        text.textContent = '';
                    }
                } else {
                    const simpleNames = {
                        '北投區': 'Beitou',
                        '士林區': 'Shilin',
                        '內湖區': 'Neihu',
                        '中山區': 'Zhongshan',
                        '中正區': 'Zhongzheng',
                        '大安區': 'Da\'an',
                        '信義區': 'Xinyi',
                        '南港區': 'Nangang',
                        '文山區': 'Wenshan'
                    };
                    text.textContent = simpleNames[mapping.district];
                }
            } else {
                text.setAttribute('font-size', '14');
                text.style.fontSize = '14px';

                if (mapping.part) {
                    if (mapping.district === '松山區') {
                        text.textContent = mapping.part === 1 ? '松山' : '區';
                    } else if (mapping.district === '大同區') {
                        const chars = ['大', '同', '區'];
                        text.textContent = chars[mapping.part - 1];
                    } else if (mapping.district === '萬華區') {
                        const chars = ['萬', '華', '區'];
                        text.textContent = chars[mapping.part - 1];
                    }
                } else {
                    text.textContent = getText('districts', mapping.district);
                }
            }

            text.style.pointerEvents = "none";
            text.style.fontWeight = "bold";
            text.style.fill = "#000000";
            text.style.transformOrigin = "center center";
        }
    });
}

// 顯示景點列表
function displayAttractions(places) {
    console.log("displayAttractions 被呼叫，當前語言:", currentLanguage);
    console.log("傳入的景點資料:", places);

    // 儲存原始資料
    currentAttractionsData = places || [];

    let attractionsHTML = '';

    if (places && places.length > 0) {
        // 只篩選地標 - 檢查多個可能的地標標示欄位
        const landmarks = places.filter(place => {
            // 檢查多種可能的地標標示
            return place.is_landmark === true ||
                place.is_building === true ||
                place.type === 'landmark' ||
                place.category === 'landmark';
        });

        console.log("篩選出的地標:", landmarks);

        if (landmarks.length > 0) {
            // 為每個地標生成 HTML
            landmarks.forEach((place, index) => {
                console.log(`處理地標 ${index}:`, place);

                // 獲取多語言名稱 - 使用與 front.js 相同的邏輯
                const placeName = currentLanguage === 'zh'
                    ? (place.name || place.name_zh || '未知地標')
                    : (place.eng_name || place.name_en || place.name || 'Unknown Landmark');

                // 獲取建築類型
                const placeType = currentLanguage === 'zh'
                    ? (place.type || place.type_zh || '')
                    : (place.eng_type || place.type_en || place.type || '');

                // 獲取描述 - 使用與 front.js 相同的邏輯
                let placeDesc;
                if (currentLanguage === 'zh') {
                    placeDesc = place.desc || place.description || place.dis || place.description_zh || getText('noDesc');
                } else {
                    placeDesc = place.en_desc || place.eng_desc || place.description_en ||
                        place.eng_dis || place.desc || place.description || place.dis || getText('noDesc');
                }

                // 獲取地址
                const placeAddress = place.address || getText('noData');

                // 修正圖片路徑處理邏輯
                let placeImage = place.image_path || place.img || place.image || place.image_url || 'img_file/placeholder.jpg';

                // 調試圖片路徑
                console.log(`地標 ${placeName} 原始圖片路徑:`, placeImage);

                // 確保圖片路徑正確 - 修改為使用 img_file
                if (placeImage && !placeImage.startsWith('http') && !placeImage.startsWith('img_file/') && !placeImage.startsWith('./img_file/')) {
                    // 移除可能的 pic/ 前綴
                    if (placeImage.startsWith('pic/')) {
                        placeImage = placeImage.replace('pic/', '');
                    }
                    // 添加正確的 img_file 前綴
                    placeImage = 'img_file/' + placeImage;
                }

                console.log(`地標 ${placeName} 最終圖片路徑:`, placeImage);
                console.log(`地標 ${placeName} 描述:`, placeDesc);

                // 生成 HTML - 使用與 front.js 完全相同的結構
                attractionsHTML += `
                <div class="nearby-place landmark-item" data-type="${placeType || ''}" id="attraction-${index}">
                    <div class="nearby-header" onclick="toggleNearbyPlace(${index})">
                        <h4>
                            ${placeName}
                            <span class="landmark-badge">${getText('landmark')}</span>
                            ${placeType ? `<span class="building-type-tag-small" data-type="${placeType}">${placeType}</span>` : ''}
                        </h4>
                        <div class="nearby-toggle"></div>
                    </div>
                    <div class="nearby-content">
                        <div class="landmark-content">
                            <div class="landmark-image-container">
                                <img src="${placeImage}" 
                                     alt="${placeName}" 
                                     class="landmark-image"
                                     onerror="this.onerror=null; this.src='img_file/placeholder.jpg'; console.log('圖片載入失敗:', '${placeImage}');"
                                     onload="console.log('圖片載入成功:', '${placeImage}');">
                            </div>
                            <div class="attraction-detail">
                                <p><span class="label">${getText('address')}</span> 
                                    <span class="address-link" onclick="openGoogleMaps('https://maps.google.com/?q=${encodeURIComponent(placeAddress)}')">${placeAddress}</span>
                                </p>
                                <p><span class="label">${getText('introduction')}</span> ${placeDesc}</p>
                            </div>
                        </div>
                    </div>
                </div>`;
            });
        } else {
            console.log("沒有找到地標資料");
            // 沒有地標時顯示
            attractionsHTML = `
            <div class="no-data-item">
                <div class="nearby-header">
                    <h4>${getText('noLandmarkInfo')}</h4>
                </div>
            </div>`;
        }
    } else {
        console.log("沒有景點資料");
        // 無資料顯示
        attractionsHTML = `
        <div class="no-data-item">
            <div class="nearby-header">
                <h4>${getText('noLandmarkInfo')}</h4>
            </div>
        </div>`;
    }

    console.log("生成的 HTML:", attractionsHTML);
    const districtAttractionsElement = document.getElementById('districtAttractions');
    if (districtAttractionsElement) {
        districtAttractionsElement.innerHTML = attractionsHTML;
    } else {
        console.error('找不到 districtAttractions 元素');
    }
}


window.toggleNearbyPlace = function (index) {
    const element = document.getElementById(`attraction-${index}`);
    if (element) {
        element.classList.toggle('active');
    }
};

// 獲取區域景點資料
async function fetchDistrictAttractions(district) {
    showLoader();
    currentDistrictKey = district;

    try {
        console.log("開始獲取區域資料:", district);
        const response = await fetch(`${API_BASE_URL}/places_by_area?area=${encodeURIComponent(district)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("API 回傳資料:", data);

        if (data.error) {
            throw new Error(data.error);
        }

        // 更新區域標題為"地標"而不是"景點"
        const translatedDistrict = getText('districts', district);
        document.getElementById('districtName').textContent = translatedDistrict + ' ' + getText('landmarks');

        // 顯示地標（會自動篩選）
        console.log("準備顯示景點，資料:", data.places);
        displayAttractions(data.places || []);

        hideLoader();
        window.goToPage('districtScreen');

    } catch (error) {
        console.error('Error fetching attractions:', error);
        hideLoader();

        const translatedDistrict = getText('districts', district);
        document.getElementById('districtName').textContent = translatedDistrict + ' ' + getText('landmarks');
        document.getElementById('districtAttractions').innerHTML = `
        <div class="error-message">
            <p>${getText('errorMessage')}</p>
            <p>${getText('errorRetry')}</p>
            <p style="color: red;">錯誤詳情: ${error.message}</p>
        </div>`;

        window.goToPage('districtScreen');
    }
}

// 確保文字始終顯示在最上層
function ensureTextOnTop() {
    const svg = document.getElementById('taipeiMap');
    const texts = svg.querySelectorAll('text');

    // 創建或獲取文字群組
    let textGroup = svg.querySelector('g.text-layer');
    if (!textGroup) {
        textGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        textGroup.classList.add('text-layer');
        textGroup.style.zIndex = '2000';
        svg.appendChild(textGroup);
    }

    // 將所有文字移動到文字群組中（但只在沒有動畫時執行）
    texts.forEach(text => {
        if (text.parentNode !== textGroup && !text.hasAttribute('transform')) {
            textGroup.appendChild(text);
        }
    });
}

// 當文檔加載完成時執行初始化
document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM content loaded");
    languageBtn = document.getElementById('languageBtn');
    languageDropdown = document.getElementById('languageDropdown');

    // 載入儲存的語言設定
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage && (savedLanguage === 'zh' || savedLanguage === 'en')) {
        currentLanguage = savedLanguage;
    }

    // 更新頁面語言
    updatePageLanguage();

    // 語言按鈕事件設定 - 只設定一次
    if (languageBtn && languageDropdown) {
        languageBtn.addEventListener('mouseenter', showDropdown);
        languageBtn.addEventListener('click', showDropdown);
        languageBtn.addEventListener('mouseleave', hideDropdownDelayed);
        languageDropdown.addEventListener('mouseenter', () => clearTimeout(window._langDropdownTimer));
        languageDropdown.addEventListener('mouseleave', hideDropdownDelayed);

        // 點選語言選項
        languageDropdown.querySelectorAll('.lang-option').forEach(opt => {
            opt.addEventListener('click', function () {
                const lang = this.getAttribute('data-lang');
                setLanguage(lang);
                languageDropdown.style.display = 'none';
            });
        });
    }

    // 設定按鈕事件
    const recognitionBtn = document.getElementById('recognitionBtn');
    const mapBtn = document.getElementById('mapBtn');

    // 為地圖按鈕添加點擊事件
    if (mapBtn) {
        mapBtn.style.backgroundColor = '#355074'; // 標示當前頁面
        mapBtn.addEventListener('click', function () {
            console.log("地圖按鈕被點擊");
            goToPage('mapContainer'); // 返回地圖容器
        });
    }

    // 確保文字在最上層
    ensureTextOnTop();

    // 地圖互動設定
    setupMapInteractions();

    // 圖片預覽功能
    setupImagePreview();

    console.log("初始化完成");
});

// 抽取地圖互動設定為獨立函數
function setupMapInteractions() {
    const paths = document.querySelectorAll('.taipei-map path');
    const texts = document.querySelectorAll('.taipei-map text');
    const districtTextMap = createDistrictTextMap(texts);

    paths.forEach(path => {
        const district = path.getAttribute('data-district');
        console.log("設定路徑事件:", district);

        if (!district) {
            console.warn("路徑缺少 data-district 屬性:", path);
            return;
        }

        // 滑鼠進入事件
        path.addEventListener('mouseenter', function () {
            handleMouseEnter(this, districtTextMap);
        });

        // 滑鼠離開事件
        path.addEventListener('mouseleave', function () {
            handleMouseLeave(this, districtTextMap);
        });

        // 點擊事件
        path.addEventListener('click', function () {
            console.log("點擊區域:", district);
            fetchDistrictAttractions(district);
        });
    });
}

// 創建區域文字對應表
function createDistrictTextMap(texts) {
    const districtTextMap = {};

    texts.forEach(text => {
        const name = text.textContent.replace(/\s/g, '');
        let districtName = name;
        const x = parseFloat(text.getAttribute('x'));
        const y = parseFloat(text.getAttribute('y'));

        // 處理分割文字的區域
        if (name === '大' && x >= 100 && x <= 120 && y >= 300 && y <= 320) {
            districtName = '大同區';
        } else if (name === '同' && x >= 100 && x <= 120 && y >= 320 && y <= 340) {
            districtName = '大同區';
        } else if (name === '區' && x >= 100 && x <= 120 && y >= 340 && y <= 360) {
            districtName = '大同區';
        } else if (name === '萬' && x >= 70 && x <= 85 && y >= 380 && y <= 400) {
            districtName = '萬華區';
        } else if (name === '華' && x >= 70 && x <= 85 && y >= 400 && y <= 420) {
            districtName = '萬華區';
        } else if (name === '區' && x >= 70 && x <= 85 && y >= 420 && y <= 440) {
            districtName = '萬華區';
        } else if (name === '松山' && x >= 200 && x <= 210 && y >= 330 && y <= 340) {
            districtName = '松山區';
        } else if (name === '區' && x >= 200 && x <= 210 && y >= 345 && y <= 355) {
            districtName = '松山區';
        } else if (name.includes('北投')) {
            districtName = '北投區';
        } else if (name.includes('士林')) {
            districtName = '士林區';
        } else if (name.includes('內湖')) {
            districtName = '內湖區';
        } else if (name.includes('中山')) {
            districtName = '中山區';
        } else if (name.includes('中正')) {
            districtName = '中正區';
        } else if (name.includes('大安')) {
            districtName = '大安區';
        } else if (name.includes('信義')) {
            districtName = '信義區';
        } else if (name.includes('南港')) {
            districtName = '南港區';
        } else if (name.includes('文山')) {
            districtName = '文山區';
        }

        if (!districtTextMap[districtName]) {
            districtTextMap[districtName] = [];
        }
        districtTextMap[districtName].push(text);
    });

    return districtTextMap;
}

// 處理滑鼠進入事件
function handleMouseEnter(path, districtTextMap) {
    const district = path.getAttribute('data-district');
    console.log("滑鼠進入:", district);

    const parent = path.parentNode;
    const svg = parent.closest('svg');
    const scaleValue = 1.19;

    // 將路徑移到最上層
    parent.appendChild(path);

    // 獲取區域中心點
    const pathBBox = path.getBBox();
    const pathCenterX = pathBBox.x + pathBBox.width / 2;
    const pathCenterY = pathBBox.y + pathBBox.height / 2;

    // 設定路徑縮放
    path.style.zIndex = "1000";
    path.style.transformOrigin = `${pathCenterX}px ${pathCenterY}px`;
    path.style.transition = "all 0.3s ease";
    path.setAttribute('transform', `scale(${scaleValue})`);
    path.classList.add('hovered');

    // 處理文字縮放
    if (district && districtTextMap[district]) {
        districtTextMap[district].forEach(textElement => {
            scaleText(textElement, pathCenterX, pathCenterY, scaleValue, svg);
        });
    }
}

// 處理滑鼠離開事件
function handleMouseLeave(path, districtTextMap) {
    const district = path.getAttribute('data-district');
    console.log("滑鼠離開:", district);

    // 重置路徑
    path.removeAttribute('transform');
    path.style.zIndex = "1";
    path.classList.remove('hovered');

    // 重置文字
    if (district && districtTextMap[district]) {
        districtTextMap[district].forEach(textElement => {
            resetText(textElement);
        });
    }
}

// 縮放文字
function scaleText(textElement, pathCenterX, pathCenterY, scaleValue, svg) {
    const x = parseFloat(textElement.getAttribute('x'));
    const y = parseFloat(textElement.getAttribute('y'));

    const offsetX = x - pathCenterX;
    const offsetY = y - pathCenterY;

    const newX = pathCenterX + offsetX * scaleValue;
    const newY = pathCenterY + offsetY * scaleValue;

    // 保存原始位置
    if (!textElement.hasAttribute('data-original-x')) {
        textElement.setAttribute('data-original-x', x);
        textElement.setAttribute('data-original-y', y);
    }

    textElement.style.zIndex = "1001";
    textElement.style.transition = "all 0.3s ease";
    textElement.setAttribute('x', newX);
    textElement.setAttribute('y', newY);
    textElement.setAttribute('transform', `scale(${scaleValue})`);
    textElement.style.transformOrigin = `${x}px ${y}px`;
    textElement.classList.add('hover-text');

    // 確保文字在最上層
    const textGroup = svg.querySelector('g.text-layer');
    if (textGroup && textElement.parentNode !== textGroup) {
        textGroup.appendChild(textElement);
    }
}

// 重置文字
function resetText(textElement) {
    textElement.removeAttribute('transform');
    textElement.style.zIndex = "";
    textElement.classList.remove('hover-text');

    // 恢復原始位置
    if (textElement.hasAttribute('data-original-x')) {
        textElement.setAttribute('x', textElement.getAttribute('data-original-x'));
        textElement.setAttribute('y', textElement.getAttribute('data-original-y'));
    }
}

// 設定圖片預覽功能
function setupImagePreview() {
    window.showPicPreview = function (event, picUrl) {
        const link = event.currentTarget;
        const preview = link.querySelector('.pic-preview');
        if (preview && picUrl) {
            preview.style.display = 'block';
        }
    };

    window.hidePicPreview = function (event) {
        const link = event.currentTarget;
        const preview = link.querySelector('.pic-preview');
        if (preview) {
            preview.style.display = 'none';
        }
    };
}

function hideScrollButtons() {
    const scrollButtons = document.querySelector('.fixed-scroll-buttons');
    if (scrollButtons) {
        scrollButtons.classList.remove('show');
    }
}

// 如果 goToPage 函數中需要使用 hideScrollButtons
window.goToPage = function (pageId) {
    const mapContainer = document.querySelector('.map-container');
    const districtScreen = document.getElementById('districtScreen');

    if (pageId === 'mapContainer') {
        mapContainer.style.display = 'flex';
        districtScreen.classList.add('hidden');
        // 隱藏滾動按鈕
        hideScrollButtons();
    } else if (pageId === 'districtScreen') {
        mapContainer.style.display = 'none';
        districtScreen.classList.remove('hidden');
    }
}