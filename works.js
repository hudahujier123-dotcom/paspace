document.documentElement.setAttribute('lang', 'ar');
document.documentElement.setAttribute('dir', 'rtl');

/* ==========================================================
   بيانات الأعمال — لإضافة عمل جديد أضف سطراً واحداً هنا:
   title : عنوان البطاقة
   type  : "eng" لأعمال الفريق الهندسي، "content" لأعمال صناعة المحتوى
   icon  : web | app | edu | travel | video
   url   : رابط العمل (يفتح في تبويب جديد)
   ========================================================== */
const WORKS = [
  { title: "موقع شركة شحن",        type: "eng",     icon: "web",    url: "https://earthshipments.net/" },
  { title: "موقع شركة عقارات",     type: "eng",     icon: "web",    url: "https://aqar.duosparktech.com/" },
  { title: "تطبيق تعليمي أكاديمي", type: "eng",     icon: "edu",    url: "https://play.google.com/store/apps/dev?id=6532504182308452615" },
  { title: "تطبيق سفر",            type: "eng",     icon: "travel", url: "https://play.google.com/store/apps/details?id=com.eficta.flights&pcampaignid=web_share" },
  { title: "إعلان مرئي 1",         type: "content", icon: "video",  url: "https://www.instagram.com/reel/Ddq53ILKdt5/?stkn=cWp2aDd3bzV2bGJ1" },
  { title: "إعلان مرئي 2",         type: "content", icon: "video",  url: "https://www.instagram.com/reel/DYKCwQBMDxM/?stkn=MW12ZzJ0dXJmYWo5bg==" },
  { title: "إعلان مرئي 3",         type: "content", icon: "video",  url: "https://www.instagram.com/reel/Dc_NIc_ROe3/?stkn=MTVlZzFxZjBsNXk2Yw==" },
  { title: "إعلان مرئي 4",         type: "content", icon: "video",  url: "https://www.instagram.com/reel/DZzSMYisqot/?stkn=MTJpZ3ByZWxhb2tkYQ==" },
  { title: "إعلان مرئي 5",         type: "content", icon: "video",  url: "https://www.instagram.com/reel/DZ25P6ZKD9y/?stkn=bndleHBmcWpjNWdl" }
];
