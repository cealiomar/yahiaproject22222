/* ══════════════════════════════════════════════════════════════
   i18n — every user-facing string lives here.
   To add a language: copy a block, translate, add it to LANGS.
   ══════════════════════════════════════════════════════════════ */

window.LANGS = {
  ar: { dir:'rtl', label:'EN', next:'en' },
  en: { dir:'ltr', label:'ع',  next:'ar' }
};

window.I18N = {

/* ─────────────────────────── العربية ─────────────────────────── */
ar: {
  'brand.sub':'سجل الضمان الرقمي',
  'nav.verify':'شيّك على ضمانك', 'nav.how':'كيف يشتغل', 'nav.support':'تحتاج مساعدة',

  'hero.eyebrow':'ضمانك الرقمي',
  'hero.t1':'ضمانك',
  'hero.t2':'ما يضيع',
  'hero.lede':'امسح الكود اللي على منتجك من Precious Shield، شوف ضمانك وش وضعه، وفعّله باسم سيارتك — كل هذا من الصفحة هذي، وبدون ما تكلّم أحد.',
  'hero.cta':'شيّك على ضمانك',
  'hero.scan':'امسح الكود',
  'hero.m1':'فيلم حماية يشفي خدوشه بنفسه',
  'hero.m2':'ضمان 10 – 12 سنة',
  'hero.m3':'أربع منتجات',
  'hero.scroll':'انزل',

  'con.idx':'الفحص',
  'con.title':'شيّك على ضمانك',
  'con.lede':'كل رول من Precious Shield له رقم خاص فيه. اكتبه هنا وبيطلع لك المنتج، ومدة الضمان، وهل هو مفعّل ولا لا.',
  'rail.1':'الفحص', 'rail.2':'بيانات سيارتك', 'rail.3':'الشهادة',
  'con.label':'رقم الضمان',
  'con.scanShort':'مسح',
  'con.check':'شيّك',
  'con.help':'بتلقاه على ملصق الكرتون، أو على كرت الضمان، أو في فاتورة التركيب.',
  'con.querying':'نبحث في السجل…',
  'scan.steps':'نقرأ الرقم…|ندوّر عليه في السجل…|نجهّز نتيجتك…',
  'scan.wait':'ثانية وحدة، لا تسكّر الصفحة',

  'res.product':'المنتج',
  'res.daysLeft':'يوم باقي',

  'act.idx':'بيانات سيارتك',
  'act.title':'فعّل ضمانك',
  'act.sub':'الضمان يتفعّل مرة وحدة بس ويرتبط بسيارتك نهائي. راجع البيانات زين قبل ما ترسل.',
  'act.car':'موديل السيارة',
  'act.plate':'رقم اللوحة',
  'act.vin':'رقم الشاصي (VIN) — اختياري',
  'act.phone':'جوال صاحب السيارة',
  'act.center':'مركز التركيب',
  'act.date':'تاريخ التركيب',
  'act.agree':'أقرّ إن البيانات صحيحة، وموافق على شروط ضمان Precious Shield.',
  'act.submit':'فعّل الضمان',
  'act.back':'رجوع',

  'cert.kind':'شهادة ضمان مفعّلة',
  'cert.seal':'موثّقة',
  'cert.note':'الشهادة هذي صالحة إلكترونيًا وما تحتاج ختم. تقدر تشيّك عليها أي وقت برقم ضمانك.',
  'cert.print':'احفظ / اطبع',
  'cert.again':'شيّك على رقم ثاني',

  'how.idx':'الطريقة',
  'how.title':'ثلاث خطوات وبس.',
  'how.s1t':'امسح',
  'how.s1p':'صوّب كاميرا جوالك على الكود اللي على المنتج أو كرت الضمان. بتفتح لك الصفحة والرقم جاهز فيها.',
  'how.s2t':'شيّك',
  'how.s2p':'يطلع لك المنتج ومدة الضمان ووضعه على طول: جاهز للتفعيل، ولا مفعّل، ولا خلص.',
  'how.s3t':'فعّل',
  'how.s3p':'دخّل بيانات سيارتك ومركز التركيب مرة وحدة، وتطلع لك شهادة ضمان رقمية باسمك.',
  'how.k1':'سنة ضمان — PS TITANIUM',
  'how.k2':'منتجات في العائلة',
  'how.k3':'مركز معتمد',
  'how.k4':'دقة تتبّع الرولات',

  'sup.idx':'المساعدة',
  'sup.title':'رقمك ما يشتغل؟',
  'sup.lede':'أحيانًا الملصق يتلف أو ينقص مع الفيلم. أرسل لنا صورة الفاتورة أو صورة الملصق وبنطلّع لك الرقم في أوقات الدوام.',
  'sup.wa':'كلّمنا واتساب',
  'sup.mail':'info@preciousshield.com',

  'foot.blurb':'أفلام حماية بمواصفات عالية، مصمّمة تتحمّل القيادة اليومية والجو الحار، وتخلّي سيارتك بشكلها الجديد لسنين.',
  'foot.links':'روابط سريعة',
  'foot.l1':'شيّك على ضمانك', 'foot.l2':'كيف يشتغل', 'foot.l3':'المنتجات',
  'foot.l4':'المراكز المعتمدة', 'foot.l5':'الشراكة والتوزيع',
  'foot.contact':'تواصل معنا',
  'foot.wa':'واتساب — متاح',
  'foot.addr':'٣٠ شارع جولد، مكتب ٤٠٠<br>شيريدان، وايومنغ ٨٢٨٠١ — أمريكا',
  'foot.rights':'© 2026 Precious Shield. كل الحقوق محفوظة.',
  'foot.demo':'بيانات الصفحة هذي تجريبية للعرض بس',

  'scan.title':'مسح كود الضمان',
  'scan.hint':'حطّ الكود جوّه الإطار وبيقراه لحاله.',

  /* ── runtime ── */
  'ph.wn':'PS-2026-000123',
  'ph.car':'تويوتا لاندكروزر 2024',
  'ph.plate':'أ ب ج 4821',
  'ph.center':'مركز الصقر للعناية بالسيارات',

  'st.pending':'صالح — ناقصه تفعيل',
  'st.active':'مفعّل وساري',
  'st.expired':'الضمان خلص',
  'st.notfound':'الرقم مو مسجّل',

  'msg.pending':'الرقم هذا صالح وما تفعّل لين الحين. فعّله باسم سيارتك عشان تبدأ مدة الضمان.',
  'msg.active':'ضمانك ساري ومسجّل باسم السيارة اللي فوق.',
  'msg.expired':'مدة الضمان خلصت. كلّمنا وبنشوف لك عروض التجديد.',
  'msg.notfound':'ما لقينا الرقم هذا في السجل. تأكّد من كتابته، أو أرسل لنا صورة الملصق.',

  'cta.activate':'فعّل ضمانك',
  'cta.retry':'جرّب رقم ثاني',
  'cta.viewCert':'شوف الشهادة',

  'err.empty':'اكتب رقم الضمان الأول.',
  'err.short':'الرقم قصير — تأكّد إنك ناسخه كامل.',
  'err.req':'مطلوب',
  'err.phone':'الرقم مو صحيح',
  'err.agree':'لازم توافق على الشروط.',

  'spec.years':'مدة الضمان',
  'spec.finish':'اللمعة',
  'spec.batch':'كود المنتج',
  'spec.activated':'تاريخ التفعيل',
  'spec.expires':'ينتهي في',
  'spec.center':'مركز التركيب',
  'spec.vehicle':'السيارة',
  'spec.plate':'اللوحة',
  'spec.city':'المدينة',
  'spec.vin':'رقم الشاصي',
  'spec.wn':'رقم الضمان',

  'unit.years':'سنوات',
  'unit.year':'سنة',
  'remain.lb':'الباقي من ضمانك',
  'remain.until':'لين',
  'remain.lbPending':'مدة الضمان',
  'remain.startsOn':'تبدأ من يوم التفعيل',
  'g.expired':'خلص',
  'g.daysLeft':'يوم باقي',
  'g.none':'—',

  'toast.activated':'تم تفعيل ضمانك ✦',
  'toast.scanned':'قرينا الكود',
  'toast.printed':'نفتح لك نافذة الطباعة…',

  'scan.unsupported':'متصفحك ما يدعم المسح التلقائي. استخدم كاميرا جوالك على الكود مباشرة، أو اكتب الرقم بيدك.',
  'scan.denied':'ما قدرنا نوصل للكاميرا. تأكّد إنك سمحت بالإذن، أو اكتب الرقم بيدك.',
},

/* ─────────────────────────── English ─────────────────────────── */
en: {
  'brand.sub':'Digital Warranty Registry',
  'nav.verify':'Verify', 'nav.how':'How it works', 'nav.support':'Support',

  'hero.eyebrow':'Digital warranty card',
  'hero.t1':'The shield',
  'hero.t2':'that remembers',
  'hero.lede':'Scan the code on your Precious Shield product, confirm your warranty is live, and register it to your vehicle — all from this page, without a single phone call.',
  'hero.cta':'Check your warranty',
  'hero.scan':'Scan code',
  'hero.m1':'Self-healing protection film',
  'hero.m2':'10 – 12 year warranty',
  'hero.m3':'Four products',
  'hero.scroll':'Scroll',

  'con.idx':'Verify',
  'con.title':'Warranty registry',
  'con.lede':'Every Precious Shield roll carries a unique number. Enter it here to see the product, the warranty term, and whether it has been activated.',
  'rail.1':'Verify', 'rail.2':'Vehicle details', 'rail.3':'Certificate',
  'con.label':'Warranty number',
  'con.scanShort':'Scan',
  'con.check':'Check',
  'con.help':'Found on the carton label, your warranty card, or the installation invoice.',
  'con.querying':'QUERYING REGISTRY…',
  'scan.steps':'Reading the number…|Searching the registry…|Preparing your result…',
  'scan.wait':'One moment — keep this page open',

  'res.product':'Product',
  'res.daysLeft':'days remaining',

  'act.idx':'Vehicle details',
  'act.title':'Activate warranty',
  'act.sub':'A warranty is activated once and bound permanently to the vehicle. Check the details before submitting.',
  'act.car':'Car model',
  'act.plate':'Number plate',
  'act.vin':'Chassis number (VIN) — optional',
  'act.phone':'Owner phone',
  'act.center':'Installation centre',
  'act.date':'Installation date',
  'act.agree':'I confirm these details are correct and accept the Precious Shield warranty terms.',
  'act.submit':'Activate warranty',
  'act.back':'Back',

  'cert.kind':'Activated warranty certificate',
  'cert.seal':'VERIFIED',
  'cert.note':'This certificate is valid electronically and needs no stamp. Re-check it any time with your warranty number.',
  'cert.print':'Save / print',
  'cert.again':'Check another number',

  'how.idx':'Method',
  'how.title':'Three steps. No more.',
  'how.s1t':'Scan',
  'how.s1p':'Point your phone camera at the code on the product label or warranty card. This registry opens with your number already filled in.',
  'how.s2t':'Verify',
  'how.s2p':'The product, term and status appear instantly: ready to activate, already active, or expired.',
  'how.s3t':'Activate',
  'how.s3p':'Enter the vehicle and installation centre once, and a digital warranty certificate is issued in your name.',
  'how.k1':'year warranty — PS TITANIUM',
  'how.k2':'products in the family',
  'how.k3':'certified centres',
  'how.k4':'roll traceability',

  'sup.idx':'Support',
  'sup.title':'Number not working?',
  'sup.lede':'Labels sometimes tear or get trimmed away with the film. Send us a photo of the invoice or the label and we will recover the number during working hours.',
  'sup.wa':'Message us on WhatsApp',
  'sup.mail':'info@preciousshield.com',

  'foot.blurb':'Premium-quality protection films engineered to withstand daily driving and harsh climates while keeping a vehicle looking factory-new for years.',
  'foot.links':'Quick links',
  'foot.l1':'Warranty check', 'foot.l2':'How it works', 'foot.l3':'Products',
  'foot.l4':'Certified centres', 'foot.l5':'Partnership',
  'foot.contact':'Contact',
  'foot.wa':'WhatsApp available',
  'foot.addr':'30 N Gould St, Ste 400<br>Sheridan, Wyoming 82801 — USA',
  'foot.rights':'© 2026 Precious Shield. All rights reserved.',
  'foot.demo':'All data on this page is demo content',

  'scan.title':'Scan warranty code',
  'scan.hint':'Place the code inside the frame. It reads automatically.',

  /* ── runtime ── */
  'ph.wn':'PS-2026-000123',
  'ph.car':'Toyota Land Cruiser 2024',
  'ph.plate':'ABC 4821',
  'ph.center':'Falcon Auto Care',

  'st.pending':'Valid — pending activation',
  'st.active':'Active',
  'st.expired':'Warranty expired',
  'st.notfound':'Number not registered',

  'msg.pending':'This number is valid and not yet activated. Register it to your vehicle to start the warranty term.',
  'msg.active':'This warranty is live and registered to the vehicle shown above.',
  'msg.expired':'This warranty term has ended. Contact us about renewal options.',
  'msg.notfound':'We could not find this number in the registry. Check the spelling, or send us a photo of the label.',

  'cta.activate':'Activate warranty',
  'cta.retry':'Try another number',
  'cta.viewCert':'View certificate',

  'err.empty':'Enter a warranty number first.',
  'err.short':'That looks too short — check you copied it all.',
  'err.req':'Required',
  'err.phone':'Invalid number',
  'err.agree':'You must accept the terms.',

  'spec.years':'Warranty term',
  'spec.finish':'Finish',
  'spec.batch':'Product code',
  'spec.activated':'Activated on',
  'spec.expires':'Expires on',
  'spec.center':'Installation centre',
  'spec.vehicle':'Vehicle',
  'spec.plate':'Plate',
  'spec.city':'City',
  'spec.vin':'VIN',
  'spec.wn':'Warranty number',

  'unit.years':'years',
  'unit.year':'year',
  'remain.lb':'Warranty remaining',
  'remain.until':'until',
  'remain.lbPending':'Warranty term',
  'remain.startsOn':'starts on the day you activate',
  'g.expired':'expired',
  'g.daysLeft':'days remaining',
  'g.none':'—',

  'toast.activated':'Warranty activated ✦',
  'toast.scanned':'Code captured',
  'toast.printed':'Opening print dialog…',

  'scan.unsupported':'Your browser cannot auto-scan. Use your phone camera on the code directly, or type the number in.',
  'scan.denied':'We could not reach the camera. Allow permission, or type the number in.',
}
};

/* finish names are product data, so they live with the language */
window.FINISH = {
  ar:{ gloss:'لامع', satin:'مطفي ستان', matte:'مطفي' },
  en:{ gloss:'Gloss', satin:'Satin', matte:'Matte' }
};

/* loader ticker lines */
window.LOADER_LINES = {
  ar: ['نجهّز السجل…','نحمّل الواجهة…','نتحقق من الشهادات…','جاهز'],
  en: ['Initialising registry…','Loading the interface…','Verifying certificates…','Ready']
};
