//ماتحاول قافل عرض الداتابيز 
    const SUPABASE_URL = 'https://wxalmjkwstlstzktnuyz.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4YWxtamt3c3Rsc3R6a3RudXl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyNTMwMTcsImV4cCI6MjEwNDgyOTAxN30.Dr_W7B0hI9VuvlAUHHUiw_UP9gKAHttOB6Wq5cxIoG8';

    const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    let currentSearchTerm = '';

// عرض المكان
    window.addEventListener("DOMContentLoaded", () => {
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
});



async function scb() {
    const input = document.getElementById('searchInput').value.trim();
    if (!input) return;
    if (input == "دازاي") {
        document.getElementById('resultarea').classList.remove('hidden');
        document.getElementById('resultarea').innerHTML = '<img src="daz.jpg" class="w-full max-w-md mx-auto rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 object-cover border border-gray-700/50">';
        return;
    }

    let cleanInput = parseArabicNumbers(input);

    const containsLetters = /[^0-9]/.test(cleanInput);

    if (containsLetters) {
        showError(' البحث متاح برقم الجلوس فقط ( أرقام ) . .');
        return;
    } else {
        currentSearchTerm = cleanInput;
        document.getElementById('resultarea').innerHTML = '';
        await fetchResults();
    }
}

    async function fetchResults() {
        const loading = document.getElementById('loading');
        const searchbtn = document.getElementById('searchbtn');
        const searchStats = document.getElementById('searchStats');
        const loadbtn = document.getElementById('loadbtn'); 

        loading.classList.remove('hidden');
        searchbtn.disabled = true;
        
        if(searchStats) searchStats.classList.add('hidden');
        if(loadbtn) loadbtn.classList.add('hidden');

        try {
            const { data, error } = await supabaseClient.rpc('get_student_stats', { 
                search_term: currentSearchTerm,
                page_num: 1,
                page_size: 1 
            });

            if (error) throw error;

            if (data.error) {
                showError(data.error);
            } else {
                appendMatches(data.matches);
            }
        } catch (err) {
            showError('حدث خطأ في الاتصال بقاعدة البيانات.');
            console.error(err); //لا اهتم هكر كان تقدر  : )
        } finally {
            loading.classList.add('hidden');
            searchbtn.disabled = false;
        }
    }

    // دالة تحويل الأرقام والفواصل العربية إلى تنسيق برمجي صحيح
function parseArabicNumbers(str) {
    if (!str) return '';
    
    // مصفوفة الأرقام العربية
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    
    // تحويل كل رقم عربي إلى ما يقابله بالإنجليزي
    for (let i = 0; i < 10; i++) {
        let regex = new RegExp(arabicNumbers[i], 'g');
        str = str.replace(regex, i);
    }
    
    // تحويل أي فاصلة (عربية أو أجنبية) إلى نقطة عشرية
    return str.replace(/،/g, '.').replace(/,/g, '.');
}


    function appendMatches(matches) {
        const resultarea = document.getElementById('resultarea');
        let htmlContent = '';
        
        matches.forEach(item => {
            const student = item.student;
            if (student.status === 'نجاح') {
                htmlContent += `
                    <div class="relative overflow-hidden border border-green-500/30 bg-gradient-to-br from-green-900/20 to-transparent p-6 rounded-2xl shadow-lg backdrop-blur-sm transition-all hover:border-green-500/50">
                        <div class="pb-3">
                        <div class="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-500"></div>
                        
                        <h2 class="text-2xl font-bold text-green-400 mb-1">${student.name}</h2>
                        <p class="text-gray-400 text-sm mb-5">رقم الجلوس: <strong class="text-gray-200">${student.seat_no}</strong></p>
                        
                        <div class="grid grid-cols-2 gap-4 text-center mb-5">
                            <div class="bg-gray-900/60 p-3 rounded-xl border border-green-500/20 shadow-inner">
                                <span class="block text-xs text-gray-400 mb-1">النتيجة</span>
                                <span class="block text-xl font-bold text-green-400">${student.status}</span>
                            </div>
                            <div class="bg-gray-900/60 p-3 rounded-xl border border-green-500/20 shadow-inner">
                                <span class="block text-xs text-gray-400 mb-1">النسبة المئوية</span>
                                <span class="block text-xl font-bold text-white">${student.percentage}%</span>
                            </div>
                        </div>
                        
                        <div class="bg-gray-900/40 p-4 rounded-xl border border-gray-700/50 text-sm text-gray-300">
                            <p class="mb-2">🏆 الترتيب: <strong class="text-white">المركز ${item.rank.toLocaleString()}</strong> من أصل ${item.total_passed.toLocaleString()} ناجح.</p>
                            <p>⭐ الأداء: ضمن <strong class="text-white">أفضل ${item.top_percentage}%</strong> من الناجحين.</p>
                        </div>
                        </div>
                        <a href="universities.html?percentage=${student.percentage}" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition text-center block">
        البحث عن الجامعات الملائمة 🏛️
    </a>
                    </div>`;
            } else {
                htmlContent += `
                    <div class="relative overflow-hidden border border-red-500/30 bg-gradient-to-br from-red-900/20 to-transparent p-6 rounded-2xl shadow-lg backdrop-blur-sm transition-all hover:border-red-500/50">
                        <div class="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-red-500 to-pink-600"></div>
                        
                        <h2 class="text-2xl font-bold text-red-400 mb-1">${student.name}</h2>
                        <p class="text-gray-400 text-sm mb-5">رقم الجلوس: <strong class="text-gray-200">${student.seat_no}</strong></p>
                        
                        <div class="grid grid-cols-2 gap-4 text-center mb-5">
                            <div class="bg-gray-900/60 p-3 rounded-xl border border-red-500/20 shadow-inner">
                                <span class="block text-xs text-gray-400 mb-1">النتيجة</span>
                                <span class="block text-xl font-bold text-red-400">${student.status}</span>
                            </div>
                            <div class="bg-gray-900/60 p-3 rounded-xl border border-red-500/20 shadow-inner">
                                <span class="block text-xs text-gray-400 mb-1">النسبة المحققة</span>
                                <span class="block text-xl font-bold text-white">${student.percentage}%</span>
                            </div>
                        </div>
                    </div>`;
            }
        });

        resultarea.insertAdjacentHTML('beforeend', htmlContent);
        resultarea.classList.remove('hidden');
    }

    function showError(msg) {
        const resultarea = document.getElementById('resultarea');
        resultarea.innerHTML = `<div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded"><p class="font-bold">عذراً</p><p>${msg}</p></div>`;
        resultarea.classList.remove('hidden');
        if(document.getElementById('searchStats')) document.getElementById('searchStats').classList.add('hidden');
        if(document.getElementById('loadbtn')) document.getElementById('loadbtn').classList.add('hidden');
    }

    //menuo drop
    
    function toggleMenu() {
        const menu = document.getElementById('dropdownMenu');
        if (menu.classList.contains('opacity-0')) {
            menu.classList.remove('opacity-0', 'invisible', 'scale-95');
            menu.classList.add('opacity-100', 'visible', 'scale-100');
        } else {
            menu.classList.add('opacity-0', 'invisible', 'scale-95');
            menu.classList.remove('opacity-100', 'visible', 'scale-100');
        }
    }

    document.addEventListener('click', function(event) {
        const menu = document.getElementById('dropdownMenu');
        const btn = document.getElementById('menuBtn');
        if (menu && btn && !menu.contains(event.target) && !btn.contains(event.target)) {
            menu.classList.add('opacity-0', 'invisible', 'scale-95');
            menu.classList.remove('opacity-100', 'visible', 'scale-100');
        }
    });
    
    function toggleStats() {
        const container = document.getElementById('statsContainer');
        const icon = document.getElementById('statsIcon');

        if (container && icon) {
            if (container.classList.contains('hidden')) {
                container.classList.remove('hidden');
                icon.classList.add('rotate-180');
            } else {
                container.classList.add('hidden');
                icon.classList.remove('rotate-180');
            }
        }
    }
    
    function ester() {
        const toast = document.getElementById('manarToast');
        if (toast) {
            toast.classList.remove('scale-0', 'opacity-0');
            toast.classList.add('scale-100', 'opacity-100');
            
            setTimeout(() => {
                toast.classList.remove('scale-100', 'opacity-100');
                toast.classList.add('scale-0', 'opacity-0');
            }, 6000);
        }
    }