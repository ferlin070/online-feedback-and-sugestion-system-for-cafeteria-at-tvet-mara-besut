import { useTranslation } from 'react-i18next';

export function HomePage({ onSubmitFeedback, onTrackStatus }) {
  const { t } = useTranslation();

  return (
    <>
      {/* HERO BANNER — block navy besar (gaya mara.gov.my) */}
      <section className="hero-banner">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-24 relative z-10">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mara-gold-400/20 border border-mara-gold-300/40 text-mara-gold-200 text-[10px] font-mono uppercase tracking-[0.18em] mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-mara-gold-300 animate-pulse" />
              {t('home.eyebrow', 'Kafeteria TVET MARA Besut')}
            </span>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.08] tracking-tight text-white font-semibold">
              {t('home.title_a', 'Suara anda,')}{' '}
              <em className="not-italic text-mara-gold-300 font-display italic">
                {t('home.title_b', 'mendapat sambutan.')}
              </em>
            </h1>

            <p className="text-[15px] sm:text-lg text-sand-50/80 leading-relaxed mt-5 max-w-xl">
              {t('home.lede', 'Platform rasmi untuk aduan, cadangan, dan maklum balas kafeteria TVET MARA Besut. Setiap suara didengar, setiap aduan dijejak.')}
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-8">
              <button
                onClick={onSubmitFeedback}
                className="btn-mara-red px-6 py-3 text-sm inline-flex items-center gap-2 cursor-pointer"
              >
                {t('form.submit_feedback_btn')}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
              {onTrackStatus && (
                <button
                  onClick={onTrackStatus}
                  className="px-5 py-3 text-sm font-bold text-white border-2 border-white/40 hover:bg-white/10 hover:border-white transition-colors rounded-md cursor-pointer"
                >
                  {t('track.btn_title', 'Semak Status Aduan')} →
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: Cara Berkongsi Maklum Balas */}
      <section className="gov-section">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-10">
            <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-mara-blue-500">
              {t('home.how_eyebrow', 'Tiga Langkah Mudah')}
            </span>
            <h2 className="font-display text-3xl sm:text-4xl tracking-tight text-[var(--heading-color)] mt-2">
              {t('home.how_title', 'Cara Hantar Aduan')}
            </h2>
            <hr className="rule-gold w-24 mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                num: '01',
                title: t('home.step1_title', 'Imbas Kod QR'),
                desc: t('home.step1_desc', 'Imbas kod QR yang dipamerkan di kaunter atau meja kafeteria menggunakan kamera telefon pintar anda.'),
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3M14 17v4M17 14v3M21 14v7" /></svg>
                ),
              },
              {
                num: '02',
                title: t('home.step2_title', 'Isi Borang'),
                desc: t('home.step2_desc', 'Lengkapkan borang aduan dalam talian. Pilih kategori, tulis butiran, dan lampirkan gambar jika perlu.'),
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.4-9.4a2 2 0 112.8 2.8L11 19l-4 1 1-4 9.6-9.6z" /></svg>
                ),
              },
              {
                num: '03',
                title: t('home.step3_title', 'Jejak Status'),
                desc: t('home.step3_desc', 'Simpan ID rujukan. Gunakannya untuk menyemak status aduan anda pada bila-bila masa.'),
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                ),
              },
            ].map((step) => (
              <div key={step.num} className="gov-card p-6 relative">
                <span className="absolute top-4 right-5 font-display text-3xl font-bold text-mara-blue-100 dark:text-mara-navy-700 leading-none">
                  {step.num}
                </span>
                <div className="w-12 h-12 rounded-lg bg-mara-blue-50 dark:bg-mara-navy-800 text-mara-blue-500 dark:text-mara-blue-300 grid place-items-center mb-4">
                  {step.icon}
                </div>
                <h3 className="font-display text-lg font-semibold text-[var(--heading-color)] mb-2">
                  {step.title}
                </h3>
                <p className="text-[13px] text-mara-gray-500 dark:text-mara-gray-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION: Pautan Pantas (gaya mara.gov.my) */}
      <section className="gov-section-alt">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-8">
            <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-mara-red-500">
              {t('home.quick_eyebrow', 'Akses Pantas')}
            </span>
            <h2 className="font-display text-2xl sm:text-3xl tracking-tight text-[var(--heading-color)] mt-2">
              {t('home.quick_title', 'Pautan Pantas')}
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <button onClick={onSubmitFeedback} className="quick-tile group cursor-pointer">
              <div className="w-10 h-10 mx-auto rounded-lg bg-mara-blue-50 dark:bg-mara-navy-800 text-mara-blue-500 dark:text-mara-blue-300 grid place-items-center mb-3 group-hover:bg-mara-blue-500 group-hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              </div>
              <p className="text-[13px] font-bold text-[var(--heading-color)]">{t('home.qa_hantar', 'Hantar Aduan')}</p>
            </button>

            <button onClick={onTrackStatus} className="quick-tile group cursor-pointer">
              <div className="w-10 h-10 mx-auto rounded-lg bg-mara-blue-50 dark:bg-mara-navy-800 text-mara-blue-500 dark:text-mara-blue-300 grid place-items-center mb-3 group-hover:bg-mara-blue-500 group-hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <p className="text-[13px] font-bold text-[var(--heading-color)]">{t('home.qa_semak', 'Semak Status')}</p>
            </button>

            <a href="https://www.mara.gov.my/" target="_blank" rel="noopener noreferrer" className="quick-tile group cursor-pointer">
              <div className="w-10 h-10 mx-auto rounded-lg bg-mara-red-50 dark:bg-mara-red-900/30 text-mara-red-500 dark:text-mara-red-300 grid place-items-center mb-3 group-hover:bg-mara-red-500 group-hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.66 0 3-4 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4-3-9s1.34-9 3-9" /></svg>
              </div>
              <p className="text-[13px] font-bold text-[var(--heading-color)]">{t('home.qa_mara', 'Portal MARA')}</p>
            </a>

            <a href="https://www.mara.gov.my/hubungi-kami-3/" target="_blank" rel="noopener noreferrer" className="quick-tile group cursor-pointer">
              <div className="w-10 h-10 mx-auto rounded-lg bg-mara-gold-50 dark:bg-mara-gold-600/20 text-mara-gold-500 dark:text-mara-gold-300 grid place-items-center mb-3 group-hover:bg-mara-gold-400 group-hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.95.68l1.5 4.5a1 1 0 01-.5 1.21l-2.26 1.13a11 11 0 005.52 5.52l1.13-2.26a1 1 0 011.21-.5l4.5 1.5a1 1 0 01.68.95V19a2 2 0 01-2 2h-1C9.72 21 3 14.28 3 6V5z" /></svg>
              </div>
              <p className="text-[13px] font-bold text-[var(--heading-color)]">{t('home.qa_hubungi', 'Hubungi Kami')}</p>
            </a>
          </div>
        </div>
      </section>

      {/* SECTION: Maklumat */}
      <section className="gov-section">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="gov-card p-8 sm:p-10 bg-mara-navy-500 border-mara-navy-600 text-center">
            <h2 className="font-display text-2xl sm:text-3xl text-white mb-3">
              {t('home.cta_title', 'Bersama Membina Kafeteria Lebih Baik')}
            </h2>
            <p className="text-sand-50/80 text-[14px] max-w-2xl mx-auto leading-relaxed mb-6">
              {t('home.cta_desc', 'Setiap maklum balas anda membantu kami meningkatkan kualiti makanan, perkhidmatan, dan kemudahan kafeteria TVET MARA Besut.')}
            </p>
            <button
              onClick={onSubmitFeedback}
              className="btn-mara-red px-8 py-3 text-sm inline-flex items-center gap-2 cursor-pointer"
            >
              {t('form.submit_feedback_btn')}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
