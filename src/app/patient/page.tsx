"use client";

import "../globals.css"; 
import { useState, useEffect } from "react";

interface ClinicProfile {
  doctorName: string;
  specialty: string;
  bio: string;
  avatarUrl: string;
  mapLink: string;
  gallery: string;
  workingHours: string;
}

interface Review {
  name: string;
  rating: number;
  comment: string;
}

interface Slot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface BookingFormData {
  fullName: string;
  phone: string;
  notes: string;
}

export default function SmilixOrthodonticsPage() {
  const [profile, setProfile] = useState<ClinicProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  
  const [formData, setFormData] = useState<BookingFormData>({ fullName: "", phone: "", notes: "" });
  const [reviewData, setReviewData] = useState({ name: "", rating: 5, comment: "" });
  const [message, setMessage] = useState({ type: "", text: "" });

  // 🔴 تم تصحيح الروابط لتشير إلى السيرفر الخاص بك (Local/Next.js)
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // جلب بروفايل العيادة
        const profileRes = await fetch("/api/clinic/profile");
        const profileJson = await profileRes.json();
        if (profileJson.success) setProfile(profileJson.data);

        // جلب الأوقات المتاحة (تأكد من وجود هذا المسار في سيرفرك)
        const slotsRes = await fetch("/api/public/available-slots");
        if(slotsRes.ok) setSlots(await slotsRes.json());

        // جلب التقييمات (تأكد من وجود هذا المسار في سيرفرك)
        const reviewsRes = await fetch("/api/reviews");
        if(reviewsRes.ok) setReviews(await reviewsRes.json());
      } catch (err) {
        console.error("خطأ في جلب البيانات:", err);
      }
    };
    fetchAllData();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
        }
      });
    }, { threshold: 0.15 });

    const elements = document.querySelectorAll(".section-card, .hero-card, .info-card, .booking-card, .section-head");
    elements.forEach(el => {
      el.classList.add("reveal");
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [profile, reviews, slots]);

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(":");
    let h = parseInt(hour, 10);
    const ampm = h >= 12 ? "م" : "ص";
    h = h % 12;
    if (h === 0) h = 12;
    return `${h}:${minute} ${ampm}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-EG", { weekday: "long", year: "numeric", month: "2-digit", day: "2-digit" });
  };

  // 🔴 تم تصحيح رابط إرسال الحجز
  const submitBooking = async () => {
    if (!formData.fullName || !formData.phone || !selectedSlot) {
      setMessage({ type: "error", text: "الاسم، الهاتف، واختيار الوقت مطلوبة." });
      return;
    }

    try {
      const res = await fetch("/api/public/book-appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, slotId: selectedSlot.id })
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.message || "تعذر إرسال الحجز." });
        return;
      }

      setMessage({ type: "success", text: "تم إرسال الحجز بنجاح. سيتم التواصل معك لتأكيد الموعد." });
      setFormData({ fullName: "", phone: "", notes: "" });
      setSelectedSlot(null);
      
      // تحديث المواعيد
      const slotsRes = await fetch("/api/public/available-slots");
      if(slotsRes.ok) setSlots(await slotsRes.json());
    } catch (err) {
      setMessage({ type: "error", text: "حدث خطأ أثناء إرسال الحجز." });
    }
  };

  // 🔴 تم تصحيح رابط إضافة التقييم
  const submitReview = async () => {
    if (!reviewData.name || !reviewData.comment) return;
    try {
      await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewData)
      });
      setReviewData({ name: "", rating: 5, comment: "" });
      
      // تحديث التقييمات
      const reviewsRes = await fetch("/api/reviews");
      if(reviewsRes.ok) setReviews(await reviewsRes.json());
    } catch (err) {
      console.error("خطأ في إضافة التقييم", err);
    }
  };

  if (!profile) return <div className="min-h-screen flex items-center justify-center text-white">جاري تحميل العيادة...</div>;

  return (
    <div className="rtl">
      <header className="header">
        <div className="container header-inner">
          <div className="brand">
            <div className="brand-badge">🦷</div>
            <div>
              <h1>{profile.doctorName}</h1>
              <p>{profile.specialty || "أخصائي تقويم الأسنان والفكين"}</p>
            </div>
          </div>
          <nav className="nav">
            <a href="#services">الخدمات</a>
            <a href="#about">من نحن</a>
            <a href="#reviews">التقييمات</a>
            <a href="#location">الموقع</a>
            <a href="#booking" className="cta">احجز الآن</a>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-card">
              <div className="hero-kicker">⭐ ابتسامة متناسقة وثقة لا حدود لها</div>
              <h2>ابتسامتك المثالية تبدأ من هنا</h2>
              <p>{profile.bio || "نحن متخصصون في تصحيح اصطفاف الأسنان ومعالجة مشاكل الإطباق باستخدام أحدث تقنيات التقويم الشفاف والمعدني لضمان أفضل نتيجة بأقل وقت ممكن."}</p>
              
              <div className="hero-actions">
                <a className="btn btn-primary" href="#booking">احجز استشارتك الآن</a>
                <a className="btn btn-secondary" href="tel:0967258766">📞 اتصل بنا</a>
                <a className="btn btn-secondary" href="https://wa.me/963967258766" target="_blank" rel="noreferrer">💬 واتساب</a>
              </div>
            </div>

            <div className="hero-side">
              <div className="info-card">
                <div className="stats">
                  <div className="stat"><div className="label">حالات تم علاجها</div><div className="value">+1500</div></div>
                  <div className="stat"><div className="label">نسبة النجاح</div><div className="value">99%</div></div>
                  <div className="stat"><div className="label">تقييم المرضى</div><div className="value">4.9★</div></div>
                  <div className="stat"><div className="label">متابعة مستمرة</div><div className="value">24/7</div></div>
                </div>
              </div>

              <div className="info-card quick-contact">
                <a href="#location"><span>📍 العنوان: درعا - حي السبيل</span><span>افتح</span></a>
                <a href="tel:0950081667"><span>📞 0950081667</span><span>اتصال</span></a>
              </div>
            </div>
          </div>

          <div className="container" style={{ marginTop: '20px' }}>
             <div className="section-card" style={{ display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap" }}>
                <img 
                  src={profile.avatarUrl || "/assets/doctor.jpg"} 
                  style={{ width: "160px", height: "160px", borderRadius: "20px", objectFit: "cover", border: "2px solid rgba(255,255,255,0.1)" }} 
                  alt="صورة الطبيب"
                />
                
                <div style={{ flex: "1 1 300px" }}>
                  <h3>👨‍⚕️ {profile.doctorName}</h3>
                  <p style={{ color: "var(--muted)", lineHeight: 1.8 }}>{profile.bio}</p>
                  <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", marginTop: "10px" }}>
                    <div>⭐️ 5 تقييم</div>
                    <div>👥 +1500 مريض</div>
                    <div>🦷 أخصائي تقويم</div>
                  </div>
                </div>

                <video controls width="100%" style={{ borderRadius: "20px", marginTop: "15px", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <source src="/assets/doctor.mp4" type="video/mp4" />
                  متصفحك لا يدعم تشغيل الفيديو.
                </video>
             </div>
          </div>
        </section>

        <section id="services" className="section">
          <div className="container">
            <div className="section-head">
              <h3>خدمات التقويم</h3>
              <p>نوفر خيارات علاجية متقدمة تناسب جميع الأعمار والحالات.</p>
            </div>
            <div className="services-grid">
              <div className="section-card">
                <div className="service-icon">✨</div>
                <h4>التقويم الشفاف (Invisalign)</h4>
                <p>قوالب شفافة ومتحركة لتصحيح الأسنان بدون أسلاك معدنية لراحة ومظهر جمالي أثناء العلاج.</p>
              </div>
              <div className="section-card">
                <div className="service-icon">🦷</div>
                <h4>التقويم المعدني التقليدي</h4>
                <p>الخيار الأكثر فعالية والأسرع لعلاج الحالات المعقدة وتصحيح الإطباق بدقة عالية.</p>
              </div>
              <div className="section-card">
                <div className="service-icon">💎</div>
                <h4>التقويم الخزفي (الكريستالي)</h4>
                <p>دعامات بلون الأسنان تجعل التقويم شبه مخفي ليناسب الأشخاص الذين يفضلون مظهراً هادئاً.</p>
              </div>
              <div className="section-card">
                <div className="service-icon">🔬</div>
                <h4>أجهزة تعديل نمو الفكين</h4>
                <p>تدخل مبكر للأطفال لتوجيه نمو الفكين وتفادي الحاجة للجراحة في المستقبل.</p>
              </div>
              <div className="section-card">
                <div className="service-icon">🛡️</div>
                <h4>مثبتات ما بعد التقويم</h4>
                <p>مثبتات شفافة وسلكية لضمان بقاء الأسنان في مكانها الصحيح وتجنب أي انتكاس.</p>
              </div>
              <div className="section-card">
                <div className="service-icon">😁</div>
                <h4>تصميم الابتسامة</h4>
                <p>دراسة الحالة كاملة بالأشعة والصور الرقمية لبناء خطة تقويم تمنحك توازن مثالي للوجه.</p>
              </div>
            </div>
          </div>
        </section>

        {profile.gallery && (
          <section className="section">
            <div className="container">
              <div className="section-head">
                <h3>حالات تم علاجها</h3>
                <p>شاهد نتائج قبل وبعد لبعض حالات التقويم في عيادتنا.</p>
              </div>
              <div className="services-grid">
                {profile.gallery.split(',').map((imgUrl, idx) => (
                  <img key={idx} src={imgUrl.trim()} className="section-card" style={{ width: '100%', height: '220px', objectFit: 'cover', padding: 0 }} alt="حالة تقويم" />
                ))}
              </div>
            </div>
          </section>
        )}

        <section id="reviews" className="section">
          <div className="container">
            <div className="section-head">
              <h3>آراء المرضى</h3>
              <p>قصص نجاح وابتسامات تغيرت بفضل رحلة التقويم معنا.</p>
            </div>
            <div className="reviews-grid">
              {reviews.map((r, i) => (
                <div key={i} className="section-card">
                  <div className="review-stars">{"★".repeat(r.rating)}</div>
                  <p>{r.comment}</p>
                  <div className="review-name">{r.name}</div>
                </div>
              ))}
            </div>

            <div className="section-card" style={{ marginTop: "20px" }}>
              <h4>أضف تجربتك</h4>
              <div className="grid" style={{ marginTop: '15px' }}>
                <input value={reviewData.name} onChange={e => setReviewData({...reviewData, name: e.target.value})} placeholder="اسمك" />
                <select value={reviewData.rating} onChange={e => setReviewData({...reviewData, rating: Number(e.target.value)})}>
                  <option value="5">⭐️⭐️⭐️⭐️⭐️</option>
                  <option value="4">⭐️⭐️⭐️⭐️</option>
                  <option value="3">⭐️⭐️⭐️</option>
                  <option value="2">⭐️⭐️</option>
                  <option value="1">⭐️</option>
                </select>
                <textarea value={reviewData.comment} onChange={e => setReviewData({...reviewData, comment: e.target.value})} placeholder="كيف كانت رحلة علاجك؟" className="full" />
                <button className="btn btn-primary" onClick={submitReview}>نشر التقييم</button>
              </div>
            </div>
          </div>
        </section>

        <section id="booking" className="booking">
          <div className="container">
            <div className="section-head">
              <h3>احجز استشارتك</h3>
              <p>خطوتك الأولى نحو ابتسامة منتظمة تبدأ باختيار موعدك.</p>
            </div>

            <div className="booking-card">
              <div className="booking-grid">
                <div className="booking-side">
                  <div className="booking-note">
                    <h4>الأوقات المتاحة</h4>
                    <div className="slots-list">
                      {slots.length === 0 ? (
                        <div className="empty">لا توجد أوقات متاحة حاليًا.</div>
                      ) : (
                        slots.map(slot => (
                          <div 
                            key={slot.id} 
                            className={`slot-item ${selectedSlot?.id === slot.id ? 'active' : ''}`}
                            onClick={() => setSelectedSlot(slot)}
                          >
                            <div className="slot-date">{formatDate(slot.date)}</div>
                            <div className="slot-time">{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="booking-form-wrap">
                  {message.text && <div className={`message ${message.type}`}>{message.text}</div>}
                  <div className="grid">
                    <div className="field">
                      <label>الاسم الكامل</label>
                      <input value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="اكتب اسمك الكامل" />
                    </div>
                    <div className="field">
                      <label>رقم الهاتف</label>
                      <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="مثال: 0995339401" />
                    </div>
                    <div className="field full">
                      <label>ملاحظات الاستشارة (اختياري)</label>
                      <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="هل قمت بتركيب تقويم سابقاً؟ أو هل تعاني من ألم في الفك؟" />
                    </div>
                    <div className="field full">
                      <label>الوقت المختار</label>
                      <input readOnly value={selectedSlot ? `${formatDate(selectedSlot.date)} | ${formatTime(selectedSlot.startTime)} - ${formatTime(selectedSlot.endTime)}` : "الرجاء اختيار وقت من القائمة"} />
                    </div>
                    <div className="field full">
                      <button className="btn btn-primary" onClick={submitBooking}>إرسال طلب الحجز</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

     <section id="location" className="section">
          <div className="container">
            <div className="section-head">
              <h3>موقع العيادة وأوقات الدوام</h3>
            </div>
            
            {/* استخدام Grid لعرض الخريطة وأوقات الدوام بجانب بعضهما */}
            <div className="contact-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
              
              {/* بطاقة الخريطة */}
              <div className="section-card">
                <div className="map-frame">
                  <iframe 
                    src={profile.mapLink || "https://www.google.com/maps?q=عيادة الدكتور شعلان صيدا سوريا&output=embed"} 
                    width="100%" height="250" style={{ border: 0, borderRadius: "20px" }} loading="lazy">
                  </iframe>
                </div>
                <a href={profile.mapLink} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ width: "100%", marginTop: "15px" }}>
                  📍 فتح في Google Maps
                </a>
              </div>

              {/* بطاقة أوقات الدوام */}
              <div className="section-card" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <h4 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px", fontSize: "1.2rem" }}>
                  🕒 ساعات العمل
                </h4>
                
                {/* استخدام pre-wrap للحفاظ على تنسيق الأسطر إذا كانت محفوظة بنزول سطر */}
                <div style={{ color: "var(--muted)", lineHeight: 2, fontSize: "1rem", whiteSpace: "pre-wrap" }}>
                  {profile.workingHours ? (
                    profile.workingHours
                  ) : (
                    // النص الافتراضي في حال لم يقم الطبيب بإدخال الأوقات في الإعدادات
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "10px", marginBottom: "10px" }}>
                        <span>السبت - الخميس:</span>
                        <span style={{ color: "white", fontWeight: "bold" }}>10:00 ص - 08:00 م</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>الجمعة:</span>
                        <span style={{ color: "#ef4444", fontWeight: "bold" }}>مغلق (عطلة أسبوعية)</span>
                      </div>
                    </>
                  )}
                </div>
                
                <div style={{ marginTop: "auto", paddingTop: "20px" }}>
                  <a href="tel:0950081667" className="btn btn-secondary" style={{ width: "100%", textAlign: "center" }}>
                    📞 اتصل للاستفسار
                  </a>
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <div className="footer-card">
            <span>© جميع الحقوق محفوظة - عيادة الدكتور عمار الحمادي لتقويم الأسنان</span>
            <span>الهاتف: 0950081667</span>
          </div>
        </div>
      </footer>
    </div>
  );
}