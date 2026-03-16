# 🗺️ AI Startup Analyzer — Feature Plan

## الحالة الحالية
المشروع يحلل الفكرة عبر 7 agents ويعرض النتائج في صفحة واحدة.

---

## المميزات المطلوب إضافتها

---

### 1. 🎯 Risk Matrix (مصفوفة المخاطر)
**الأولوية**: عالية | **الصعوبة**: سهلة

**الوصف**: جدول بصري 4×4 يصنف المخاطر حسب (الاحتمالية × التأثير)
- محاور: قليل / متوسط / عالي / شديد الأهمية
- الألوان: أخضر → أصفر → برتقالي → أحمر
- كل خطر له رقم وعنوان

**التنفيذ**:
- Backend: agent جديد `RiskAssessmentAgent` يولد قائمة مخاطر مع (probability, impact, title)
- Frontend: component `RiskMatrix` يعرض الـ grid بالألوان
- Schema: إضافة `riskAssessment` field في Analysis

---

### 2. 📅 Project Roadmap (خطة المراحل)
**الأولوية**: عالية | **الصعوبة**: سهلة

**الوصف**: 4 مراحل زمنية لتنفيذ المشروع
- كل مرحلة: عنوان + وصف + مدة زمنية (بالأسابيع)
- مرحلة 1: البحث والتخطيط
- مرحلة 2: تطوير النموذج الأولي
- مرحلة 3: تحضير الإطلاق
- مرحلة 4: التقييم وما بعد الإطلاق

**التنفيذ**:
- Backend: يضاف للـ `FinalReportAgent` أو agent منفصل
- Frontend: component `Roadmap` بـ timeline بصري
- Schema: إضافة `roadmap` field في Analysis

---

### 3. 💼 Business Model Matching
**الأولوية**: عالية | **الصعوبة**: متوسطة

**الوصف**: "فكرتك تتوافق مع X من أصل 43 نموذجاً تجارياً"
- قائمة بأبرز النماذج المتوافقة مع شرح مختصر
- مثال: SaaS، Marketplace، Freemium، Enterprise...

**التنفيذ**:
- Backend: تحديث `MonetizationAgent` يرجع matched models + total count
- Frontend: عداد بصري كبير + cards للنماذج المتوافقة
- Schema: إضافة `businessModelCount` و `matchedModels` في Analysis

---

### 4. 👥 Target Audience Cards
**الأولوية**: متوسطة | **الصعوبة**: سهلة

**الوصف**: بدل النص العادي، cards بصرية لكل شريحة مستهدفة
- اسم الشريحة + وصف مختصر
- مستوى صعوبة الوصول: سهل / متوسط / صعب (badge ملون)

**التنفيذ**:
- Backend: تحديث `IdeaAnalyzerAgent` يرجع targetAudience كـ array of objects
- Frontend: تحديث عرض الـ targetUsers بـ cards

---

### 5. 🏆 Competitor Cards (بصري)
**الأولوية**: متوسطة | **الصعوبة**: سهلة

**الوصف**: بدل النص، cards بصرية للمنافسين
- اسم المنافس + وصف مختصر
- placeholder logo (أول حرف من الاسم)
- strengths و weaknesses

**التنفيذ**:
- Backend: البيانات موجودة بالفعل في `CompetitorAnalysisAgent`
- Frontend: تحديث عرض المنافسين بـ cards بصرية فقط

---

### 6. 📊 TAM/SAM/SOM Visual (Venn Diagram)
**الأولوية**: متوسطة | **الصعوبة**: متوسطة

**الوصف**: بدل النص، دوائر متداخلة بصرية
- TAM (السوق الكلي) - دائرة كبيرة
- SAM (السوق المستهدف) - دائرة متوسطة
- SOM (الحصة المتوقعة) - دائرة صغيرة
- كل دائرة فيها القيمة المالية

**التنفيذ**:
- Backend: تحديث `MarketResearchAgent` يرجع أرقام TAM/SAM/SOM
- Frontend: SVG component أو recharts للـ Venn diagram

---

### 7. 💰 Financial Plan (PRO Feature)
**الأولوية**: منخفضة | **الصعوبة**: صعبة

**الوصف**: خطة تمويل مفصلة (Premium فقط)
- احتياجات التمويل
- توقعات نقطة التعادل
- توقعات الإيرادات (سنة 1، 2، 3)
- نموذج مالي مبسط

**التنفيذ**:
- Backend: agent جديد `FinancialPlanAgent` (PRO plan فقط)
- Frontend: locked section مع upgrade prompt للـ FREE users
- Stripe: ربط بـ PRO subscription

---

### 8. 🗂️ Sidebar Navigation (تبويبات)
**الأولوية**: منخفضة | **الصعوبة**: صعبة

**الوصف**: بدل صفحة واحدة طويلة، sidebar مع تبويبات
- ملخص / تحليل / ماركة / خطة العمل / بجفذ
- تحت "تحليل": Customers, Competition, Market, Business Model, MVP, Risk, Financial

**التنفيذ**:
- Frontend: إعادة هيكلة صفحة `analysis/[id]/page.tsx` بالكامل
- إضافة sidebar component مع active state

---

## ترتيب التنفيذ المقترح

| # | الميزة | الأولوية | الصعوبة | الوقت المتوقع |
|---|--------|----------|---------|---------------|
| 1 | Risk Matrix | 🔴 عالية | ⭐ سهلة | يوم |
| 2 | Project Roadmap | 🔴 عالية | ⭐ سهلة | يوم |
| 3 | Business Model Matching | 🔴 عالية | ⭐⭐ متوسطة | يوم |
| 4 | Competitor Cards | 🟡 متوسطة | ⭐ سهلة | نص يوم |
| 5 | Target Audience Cards | 🟡 متوسطة | ⭐ سهلة | نص يوم |
| 6 | TAM/SAM/SOM Visual | 🟡 متوسطة | ⭐⭐ متوسطة | يوم |
| 7 | Financial Plan | 🟢 منخفضة | ⭐⭐⭐ صعبة | 3 أيام |
| 8 | Sidebar Navigation | 🟢 منخفضة | ⭐⭐⭐ صعبة | يومين |

---

## الملفات المتأثرة لكل ميزة

### Backend
- `apps/backend/src/agents/` ← agents جديدة أو تحديث
- `packages/db/prisma/schema.prisma` ← fields جديدة
- `apps/backend/src/queue/analysis.processor.ts` ← إضافة agents جديدة

### Frontend
- `apps/frontend/src/app/analysis/[id]/page.tsx` ← إضافة components
- `apps/frontend/src/components/` ← components جديدة
