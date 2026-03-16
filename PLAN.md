# 🗺️ AI Startup Analyzer — Feature Plan

## الحالة الحالية
المشروع يحلل الفكرة عبر 7 agents ويعرض النتائج في صفحة واحدة.

---

## ✅ المميزات المكتملة

| الميزة | الملفات |
|--------|---------|
| Risk Matrix (مصفوفة المخاطر) | `risk-radar.agent.ts` + `RiskRadar.tsx` |
| Project Roadmap (إنجازات اللاعب الأفضل) | `roadmap.agent.ts` + `Roadmap.tsx` |
| Business Model Matching (43 نموذج) | `business-model.agent.ts` + `BusinessModel.tsx` |
| Target Audience Cards | `idea-analyzer.agent.ts` + `TargetAudienceCards.tsx` |
| Competitor Cards | `competitor-analysis.agent.ts` + `CompetitorCards.tsx` |
| TAM/SAM/SOM Visual | `market-research.agent.ts` + `MarketSizeVisual.tsx` |

---

## 🔄 المميزات المطلوب إضافتها

---

### 1. 🗂️ Sidebar Navigation ← **الأولوية الأولى**
**الصعوبة**: صعبة | **الأثر**: يغير شكل التطبيق كله

**الوصف** (من الصورة):
- Sidebar ثابت على اليسار عرض ~220px
- Header: اسم المشروع (من الفكرة) + أيقونة
- أقسام رئيسية:
  - 📋 **ملخص** - الصفحة الرئيسية (Summary)
  - 🔍 **تحليل** - مع sub-items قابلة للطي:
    - Customers (Target Audience)
    - Competition (Competitor Cards)
    - Market Potential (TAM/SAM/SOM)
    - Business Model
    - MVP
    - Risk Assessment
    - Financial Plan (PRO - locked)
  - 🎨 **ماركة** - Brand Identity (جديد)
  - 📋 **خطة العمل** - Business Plan
  - 💰 **بجفذ** - Budget Estimator (جديد)
  - ➕ **أكثر**
- Active state واضح على الـ item المحدد
- Collapse/expand للـ sub-items
- زر "جميع الأفكار" في الأعلى للرجوع للـ dashboard
- User info في الأسفل (email + plan badge)

**التنفيذ**:
- إنشاء `Sidebar.tsx` component
- إعادة هيكلة `analysis/[id]/page.tsx` لـ layout مع sidebar
- كل section يصبح component منفصل
- الـ main content area تعرض الـ section المحدد

**الملفات المتأثرة**:
- `apps/frontend/src/components/Sidebar.tsx` ← جديد
- `apps/frontend/src/app/analysis/[id]/page.tsx` ← إعادة هيكلة كاملة
- `apps/frontend/src/components/SummarySection.tsx` ← جديد
- `apps/frontend/src/components/AnalysisSection.tsx` ← جديد

---

### 2. 🎯 Vision & Mission Cards ← **الأولوية الثانية**
**الصعوبة**: سهلة | **الأثر**: بصري كبير

**الوصف** (من الصورة):
- Card للـ Vision: عنوان + نص
- Card للـ Mission: عنوان + نص
- يظهران في صفحة الملخص تحت "الفكرة"

**التنفيذ**:
- Backend: تحديث `final-report.agent.ts` يضيف `vision` و `mission` للـ output
- Frontend: إضافة Vision & Mission cards في الـ Summary section

**الملفات المتأثرة**:
- `apps/backend/src/agents/final-report.agent.ts` ← إضافة vision/mission
- `apps/frontend/src/components/SummarySection.tsx` ← إضافة cards

---

### 3. 🎨 Brand Identity Agent ← **الأولوية الثالثة**
**الصعوبة**: متوسطة | **الأثر**: section جديد كامل

**الوصف** (من الصورة - قسم "ماركة"):
- اقتراح اسم للمشروع
- tagline / slogan
- brand colors (3-4 ألوان مع hex codes)
- tone of voice
- brand personality
- logo concept (وصف نصي)

**التنفيذ**:
- Backend: agent جديد `brand-identity.agent.ts`
- Schema: إضافة `brandIdentity Json?` في Analysis
- Processor: إضافة BrandIdentityAgent في pipeline
- Frontend: component `BrandIdentity.tsx`

**الملفات المتأثرة**:
- `apps/backend/src/agents/brand-identity.agent.ts` ← جديد
- `apps/backend/src/agents/agents.module.ts` ← تسجيل
- `apps/backend/src/queue/analysis.processor.ts` ← إضافة للـ pipeline
- `packages/db/prisma/schema.prisma` ← إضافة field
- `apps/frontend/src/components/BrandIdentity.tsx` ← جديد

---

### 4. 💰 Budget Estimator ← **الأولوية الرابعة**
**الصعوبة**: متوسطة | **الأثر**: section جديد

**الوصف** (من الصورة - قسم "بجفذ"):
- تقدير الميزانية المطلوبة للإطلاق
- تقسيم: Development / Marketing / Operations / Legal
- نقطة التعادل (Break-even)
- توقعات الإيرادات (سنة 1، 2، 3)

**التنفيذ**:
- Backend: agent جديد `budget-estimator.agent.ts`
- Schema: إضافة `budgetEstimate Json?` في Analysis
- Frontend: component `BudgetEstimator.tsx`

**الملفات المتأثرة**:
- `apps/backend/src/agents/budget-estimator.agent.ts` ← جديد
- `apps/backend/src/agents/agents.module.ts` ← تسجيل
- `apps/backend/src/queue/analysis.processor.ts` ← إضافة للـ pipeline
- `packages/db/prisma/schema.prisma` ← إضافة field
- `apps/frontend/src/components/BudgetEstimator.tsx` ← جديد

---

### 5. 🏷️ Analysis Type Badge
**الصعوبة**: سهلة جداً | **الأثر**: بصري صغير

**الوصف**: badge في الـ header يقول "الذكاء الاصطناعي القياسي" أو نوع التحليل

**التنفيذ**: Frontend فقط - إضافة badge في الـ header

---

## ترتيب التنفيذ

| # | الميزة | الأولوية | الصعوبة | الحالة |
|---|--------|----------|---------|--------|
| 1 | Sidebar Navigation | 🔴 عالية | ⭐⭐⭐ صعبة | ⏳ جاري |
| 2 | Vision & Mission Cards | 🔴 عالية | ⭐ سهلة | ⏳ لم يبدأ |
| 3 | Brand Identity Agent | 🟡 متوسطة | ⭐⭐ متوسطة | ⏳ لم يبدأ |
| 4 | Budget Estimator | 🟡 متوسطة | ⭐⭐ متوسطة | ⏳ لم يبدأ |
| 5 | Analysis Type Badge | 🟢 منخفضة | ⭐ سهلة | ⏳ لم يبدأ |

---

## الملفات المتأثرة الإجمالية

### Backend
- `apps/backend/src/agents/final-report.agent.ts` ← تحديث (vision/mission)
- `apps/backend/src/agents/brand-identity.agent.ts` ← جديد
- `apps/backend/src/agents/budget-estimator.agent.ts` ← جديد
- `apps/backend/src/agents/agents.module.ts` ← تحديث
- `apps/backend/src/queue/analysis.processor.ts` ← تحديث

### Database
- `packages/db/prisma/schema.prisma` ← إضافة `brandIdentity` و `budgetEstimate`

### Frontend
- `apps/frontend/src/components/Sidebar.tsx` ← جديد
- `apps/frontend/src/components/SummarySection.tsx` ← جديد
- `apps/frontend/src/components/BrandIdentity.tsx` ← جديد
- `apps/frontend/src/components/BudgetEstimator.tsx` ← جديد
- `apps/frontend/src/app/analysis/[id]/page.tsx` ← إعادة هيكلة كاملة
