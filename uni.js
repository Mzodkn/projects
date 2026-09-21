const SUPABASE_URL = 'https://wxalmjkwstlstzktnuyz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4YWxtamt3c3Rsc3R6a3RudXl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyNTMwMTcsImV4cCI6MjEwNDgyOTAxN30.Dr_W7B0hI9VuvlAUHHUiw_UP9gKAHttOB6Wq5cxIoG8';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const universitiesList = [
    "جامعة الخرطوم", "جامعة أم درمان الاسلامية", "جامعة السودان للعلوم والتكنولوجيا",
    "جامعة الجزيرة", "جامعة البطانة", "جامعة القرآن الكريم والعلوم الإسلامية",
    "جامعة القرآن الكريم وتأصيل العلوم", "جامعة النيلين", "جامعة الزعيم الأزهري",
    "جامعة بحري", "جامعة شندي", "جامعة وادي النيل", "جامعة دنقلا",
    "جامعة البحر الاحمر", "جامعة كسلا", "جامعة القضارف", "جامعة سنار",
    "جامعة النيل الأزرق", "جامعة الإمام المهدي", "جامعة بخت الرضا",
    "جامعة كردفان", "جامعة الدلنج", "جامعة غرب كردفان", "جامعة السلام",
    "جامعة الفاشر", "جامعة نيالا", "جامعة زالنجي", "جامعة الجنينة",
    "جامعة عبداللطيف الحمد التكنولوجية", "جامعة الضعين", "جامعة السودان التقانية",
    "جامعة المناقل للعلوم والتكنولوجيا", "جامعة شرق كردفان",
    "الجامعة التكنولوجية - الخرطوم", "جامعة العلوم الصحية – الخرطوم"
];

let currentLimit = 40;

// تجميع كل ما يجب تنفيذه عند تحميل الصفحة في مكان واحد
window.addEventListener('DOMContentLoaded', () => {
    // 1. تعبئة قائمة الجامعات
    populateUniversities();
    
    // 2. تلوين الزر النشط في القائمة المنسدلة
    let currentPage = window.location.pathname.split("/").pop();
    if (currentPage === "" || currentPage === "/") {
        currentPage = "index.html";
    }
    const menuLinks = document.querySelectorAll("#dropdownMenu .menu-link");
    menuLinks.forEach(link => {
        const linkHref = link.getAttribute("href");
        if (linkHref === currentPage) {
            link.className = "menu-link block px-4 py-3 text-white bg-blue-600/20 border border-blue-500/30 rounded-xl font-bold transition-all";
        } else {
            link.className = "menu-link block px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800/50 border border-transparent rounded-xl transition-all font-medium";
        }
    });

    // 3. قراءة النسبة من الـ URL إن وجدت
    const urlparm = new URLSearchParams(window.location.search);
    let percentageParam = urlparm.get('percentage');
    
    if (percentageParam) {
        percentageParam = percentageParam.replace(',', '.'); // تحويل الفاصلة إلى نقطة
        const percentageInput = document.getElementById("percentage");
        if (percentageInput) {
            percentageInput.value = percentageParam;
        }
    }

    // 4. تشغيل الدوال الأساسية (نضعها خارج الشرط لتعمل دائماً سواء جاء بنسبة أو بدون)
    if (typeof fetchResults === "function") {
        fetchResults();
    }
    initSmartNavbar();
});

function initSmartNavbar() {
    let lastScrollTop = 0;
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', function() {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 50) {
            if(navbar) {
                navbar.style.transform = 'translateY(-150%)';
                navbar.style.opacity = '0';
            }
        } else {
            if(navbar) {
                navbar.style.transform = 'translateY(0)';
                navbar.style.opacity = '1';
            }
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    });
}

function toggleMenu() {
    const menu = document.getElementById('dropdownMenu');
    if (menu) {
        menu.classList.toggle('opacity-0');
        menu.classList.toggle('invisible');
        menu.classList.toggle('scale-95');
        menu.classList.toggle('scale-100');
    }
}

window.addEventListener('click', function(e) {
    const menu = document.getElementById('dropdownMenu');
    const btn = document.getElementById('menuBtn');
    if (menu && btn && !menu.contains(e.target) && !btn.contains(e.target)) {
        menu.classList.add('opacity-0', 'invisible', 'scale-95');
        menu.classList.remove('scale-100');
    }
});

function populateUniversities() {
    const selectUni = document.getElementById('university');
    if (selectUni) {
        universitiesList.sort().forEach(uni => {
            const option = document.createElement('option');
            option.value = uni;
            option.textContent = uni;
            selectUni.appendChild(option);
        });
    }
}

function resetAndFetch() {
    currentLimit = 40;
    fetchResults();
}

function loadMore() {
    currentLimit += 40;
    fetchResults(true);
}

async function fetchResults(isAppending = false) {
    const percentage = document.getElementById('percentage')?.value;
    const university = document.getElementById('university')?.value;
    const region = document.getElementById('region')?.value;
    const admissionType = document.getElementById('admission_type')?.value || 'عام';
    const category = document.getElementById('category')?.value;
    const programSearch = document.getElementById('program_search')?.value;
    
    const grid = document.getElementById('results-grid');
    const noResults = document.getElementById('no-results');
    const loading = document.getElementById('loading');
    const loadMoreContainer = document.getElementById('load-more-container');
    const resultsTitle = document.getElementById('results-title');

    if (!isAppending) {
        grid.innerHTML = '';
    }
    noResults.classList.add('hidden');
    loading.classList.remove('hidden');

    let query = supabaseClient.from('univs').select('*', { count: 'exact' });

    if (percentage) {
        query = query.lte('percentage', parseFloat(percentage));
    }
    if (university) {
        query = query.ilike('university', `%${university}%`);
    }
    if (region) {
        query = query.eq('region', region);
    }
    if (admissionType) {
        query = query.eq('admission_type', admissionType);
    }
    if (category) {
        query = query.eq('category', category);
    }
    if (programSearch) {
        query = query.ilike('program', `%${programSearch}%`);
    }

    query = query.order('percentage', { ascending: false });
    query = query.range(isAppending ? currentLimit - 40 : 0, currentLimit - 1);

    const { data, count, error } = await query;

    loading.classList.add('hidden');

    if (error) {
        console.error("Error fetching data:", error);
        return;
    }
    
    if (resultsTitle && count !== null) {
        resultsTitle.innerText = `النتائج: يعرض ${count} تخصص متاح`;
    }
    
    if (!isAppending && data.length === 0) {
        noResults.classList.remove('hidden');
        loadMoreContainer.classList.add('hidden');
        return;
    }

    if (currentLimit < count) {
        loadMoreContainer.classList.remove('hidden');
    } else {
        loadMoreContainer.classList.add('hidden');
    }

    data.forEach(item => {
        const card = document.createElement('div');
        card.className = "bg-[#020024]/80 p-5 rounded-3xl shadow-xl border border-gray-800 backdrop-blur-xl hover:border-blue-500/50 transition flex flex-col justify-between";
        
        let genderBadgeColor = "bg-gray-800 text-gray-300 border border-gray-700";
        if (item.gender === "طالبات فقط") genderBadgeColor = "bg-pink-950/50 text-pink-300 border border-pink-800/50";
        if (item.gender === "طلاب فقط") genderBadgeColor = "bg-blue-950/50 text-blue-300 border border-blue-800/50";

        const regionText = item.region ? `📍 ${item.region}` : '';

        card.innerHTML =`
            <div>
                <div class="flex justify-between items-start mb-2">
                    <span class="inline-block px-3 py-1 text-xs font-bold bg-blue-600/20 text-blue-300 border border-blue-500/30 rounded-full">${item.category}</span>
                    <span class="inline-block px-2.5 py-0.5 text-xs font-semibold bg-emerald-950/50 text-emerald-300 border border-emerald-800/50 rounded-lg">${item.admission_type}</span>
                </div>
                <h3 class="text-lg font-bold text-white leading-tight mb-1">${item.program}</h3>
                <p class="text-sm text-gray-300 font-medium">${item.university}</p>
                <p class="text-xs text-gray-400 mb-4">${regionText}</p>
            </div>
            <div>
                <div class="border-t border-gray-800 pt-3 flex justify-between items-center mb-3">
                    <div class="text-center">
                        <span class="block text-xs text-gray-400">النسبة المطلوبة</span>
                        <span class="font-bold text-green-400 text-lg">%${item.percentage}</span>
                    </div>
                    <div class="text-center">
                        <span class="block text-xs text-gray-400">الفئة</span>
                        <span class="inline-block px-2.5 py-1 text-xs font-bold ${genderBadgeColor} rounded-xl mt-1">${item.gender}</span>
                    </div>
                </div>
                <button onclick='saveUniversity(${JSON.stringify(item)})' class="w-full bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/40 text-blue-300 font-bold py-2 rounded-xl transition text-sm flex items-center justify-center gap-2">
                    ⭐ حفظ التخصص
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function saveUniversity(item) {
    let savedList = JSON.parse(localStorage.getItem('savedUniversities')) || [];
    
    const exists = savedList.some(univ => univ.id === item.id || (univ.university === item.university && univ.program === item.program));
    
    if (!exists) {
        savedList.push(item);
        localStorage.setItem('savedUniversities', JSON.stringify(savedList));
        alert('تم حفظ التخصص بنجاح! يمكنك مراجعته في صفحة التخصصات المحفوظة.');
    } else {
        alert('هذا التخصص مضاف مسبقاً في قائمتك المحفوظة.');
    }
}