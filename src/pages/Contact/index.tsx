import React, { useEffect } from 'react';
import { Instagram, Facebook, Mail, Phone, MapPin, MessageCircle, Navigation, AlertCircle, Calendar, Package, HandHeart, Banknote } from 'lucide-react';
import { usePortalSettingsContext } from '@/contexts/PortalSettingsContext';

const Contact: React.FC = () => {
    // Usar dados do portal via Context global
    const { settings: portalSettings, loading } = usePortalSettingsContext();

    // Listener para mudanças nas configurações (debugging)
    useEffect(() => {
        // Configurações atualizadas
    }, [portalSettings]);

    // Se ainda está carregando, mostrar mensagem
    if (loading) {
        return (
            <main className="pt-20 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
                <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-16">
                    <div className="max-w-7xl mx-auto px-4 text-center">
                        <p className="text-lg text-slate-600 dark:text-slate-300">Carregando informações de contato...</p>
                    </div>
                </section>
            </main>
        );
    }

    // Socialize links baseados nas configurações do portal
    const socialLinks = [
        {
            name: 'Instagram',
            handle: portalSettings?.instagramHandle || '@ensa_itapira',
            href: `https://instagram.com/${portalSettings?.instagram || 'ensa_itapira'}`,
            icon: <Instagram className="w-6 h-6" />,
            color: 'bg-pink-600',
        },
        {
            name: 'Facebook',
            handle: portalSettings?.facebookHandle || '@educandarioensa',
            href: `https://www.facebook.com/${portalSettings?.facebook || 'educandarioensa'}`,
            icon: <Facebook className="w-6 h-6" />,
            color: 'bg-blue-600',
        },
        {
            name: 'WhatsApp',
            handle: portalSettings?.phone2 || '(19) 3863-1972',
            href: `https://wa.me/${portalSettings?.phone2?.replace(/\D/g, '') || '551938631972'}`,
            icon: <MessageCircle className="w-6 h-6" />,
            color: 'bg-green-600',
        },
    ];

    // Necessidade urgente
    const urgentNeed = {
        title: portalSettings?.urgentNeedTitle || 'Mantimentos prioritários desta semana',
        description: portalSettings?.urgentNeedDescription || 'Precisamos de verduras frescas (ex.: manjericão) para as refeições das crianças.',
        window: portalSettings?.urgentNeedWindow || 'Entrega ideal: 10 a 13/03, 8h às 16h',
        delivery: portalSettings?.urgentNeedDelivery || 'Entregar na sede - Rua José Pereira, 780, Vila Bazani, Itapira/SP',
    };

    return (
        <main className="pt-20 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
        {/* Cabeçalho */}
        <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-16">
            <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">Vamos conversar?</h1>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                Escolha o canal de sua preferência. Estamos prontos para tirar suas dúvidas sobre doações, voluntariado ou matrículas.
            </p>
            </div>
        </section>

        <section className="py-16">
            <div className="max-w-7xl mx-auto px-4">

            {/* Necessidades Urgentes */}
            <div className="mb-10">
                <div className="bg-white dark:bg-slate-800 border border-orange-100 dark:border-orange-900/50 rounded-3xl shadow-sm p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex gap-3 items-start">
                        <div className="p-3 rounded-2xl bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-orange-600 dark:text-orange-400">Necessidade urgente</p>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{urgentNeed.title}</h2>
                            <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base">{urgentNeed.description}</p>
                            <div className="flex flex-wrap gap-3 text-sm text-slate-700">
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-100">
                                    <Calendar className="w-4 h-4" /> {urgentNeed.window}
                                </span>
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                                    <MapPin className="w-4 h-4" /> {urgentNeed.delivery}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <a
                            href={`https://wa.me/${portalSettings?.phone2?.replace(/\D/g, '') || '551938631972'}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-orange-700 hover:bg-orange-800 text-white font-bold w-full sm:w-auto text-sm"
                        >
                            <MessageCircle className="w-4 h-4" /> Avisar pelo WhatsApp
                        </a>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                
                {/* Coluna 1: Redes Sociais */}
                <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Redes Sociais</h2>
                {socialLinks.map((social) => (
                    <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group"
                    >
                    <div className="flex items-center gap-4">
                        <div className={`${social.color} text-white p-3 rounded-xl`}>
                        {social.icon}
                        </div>
                        <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{social.name}</p>
                        <p className="font-bold text-slate-800 dark:text-white">{social.handle}</p>
                        </div>
                    </div>
                    <span className="text-slate-300 dark:text-slate-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">→</span>
                    </a>
                ))}
                </div>

                {/* Coluna 2: Dados de Contato Direto */}
                <div className="bg-blue-900 rounded-3xl p-8 text-white shadow-xl">
                <h2 className="text-xl font-bold mb-8">Informações Diretas</h2>
                <div className="space-y-8">
                    <div className="flex gap-4">
                    <div className="bg-white/10 p-3 rounded-xl h-fit">
                        <Mail className="w-6 h-6 text-blue-300" />
                    </div>
                    <div>
                        <p className="text-blue-200 text-sm">E-mail oficial</p>
                        <p className="font-semibold break-all">{portalSettings?.email || 'educandarionsa@yahoo.com.br'}</p>
                    </div>
                    </div>

                    <div className="flex gap-4">
                    <div className="bg-white/10 p-3 rounded-xl h-fit">
                        <Phone className="w-6 h-6 text-blue-300" />
                    </div>
                    <div>
                        <p className="text-blue-200 text-sm">Telefone Fixo</p>
                        <p className="font-semibold">{portalSettings?.phone || '(19) 3863-1972'}</p>
                    </div>
                    </div>

                    <div className="flex gap-4">
                    <div className="bg-white/10 p-3 rounded-xl h-fit">
                        <MapPin className="w-6 h-6 text-blue-300" />
                    </div>
                    <div>
                        <p className="text-blue-200 text-sm">Endereço</p>
                        <p className="font-semibold">{portalSettings?.address || 'Rua José Pereira, 780 - Vila Bazani, Itapira/SP'}</p>
                    </div>
                    </div>
                </div>

                <a
                    href={`https://www.google.com/maps/search/${encodeURIComponent(portalSettings?.address || 'Rua José Pereira, 780 - Vila Bazani, Itapira - SP')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full mt-10 bg-orange-700 hover:bg-orange-800 text-white font-bold py-4 rounded-2xl transition-colors shadow-lg flex items-center justify-center gap-2"
                >
                    <Navigation size={20} />
                    Como Chegar
                </a>
                </div>

                {/* Coluna 3: Mapa Real */}
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden h-100 lg:h-auto shadow-sm relative group">
                <iframe
                    title="Localização Educandário Nossa Senhora Aparecida"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3687.4966711842026!2d-46.826968423946425!3d-22.44796272163586!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94c8fd8aad01ccd1%3A0x16569317e4b6af9f!2sEducand%C3%A1rio%20Nossa%20Senhora%20Aparecida!5e0!3m2!1spt-BR!2sbr!4v1769234599674!5m2!1spt-BR!2sbr"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="grayscale hover:grayscale-0 transition-all duration-500"
                ></iframe>
                
                {/* Overlay discreto que some ao passar o mouse (opcional) */}
                <div className="absolute top-4 left-4 pointer-events-none group-hover:opacity-0 transition-opacity bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm text-xs font-bold text-slate-700">
                    Clique para interagir
                </div>
                </div>

            </div>
            </div>
        
        {/* Como ajudar agora */}
        <div className="max-w-7xl mx-auto px-4 mt-14">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Como ajudar agora</h2>
            <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-800 dark:text-white font-semibold mb-3">
                        <Package className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                        Doações físicas
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Entregue mantimentos, roupas e itens de higiene diretamente na sede.</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-3">{portalSettings?.address || 'Rua José Pereira, 780 - Vila Bazani'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Horário: 07h às 17h (seg a sex)</p>
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-800 dark:text-white font-semibold mb-3">
                        <Banknote className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                        Doações financeiras
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Transfira via PIX ou dados bancários. Transparência e prestação de contas garantidas.</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-3">PIX: {portalSettings?.pixKey || 'contato@educandarionsa.com.br'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Banco do Brasil · Ag. 0000 · C/C 000000-0 · CNPJ 00.000.000/0000-00</p>
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 text-slate-800 dark:text-white font-semibold mb-3">
                        <HandHeart className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                        Voluntariado
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Doe tempo e habilidades: oficinas, esporte, comunicação ou apoio administrativo.</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-3">Fale com a equipe pelo WhatsApp</p>
                    <a
                        href={`https://wa.me/${portalSettings?.phone2?.replace(/\D/g, '') || '551938631972'}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900 mt-2"
                    >
                        <MessageCircle className="w-4 h-4" /> Quero ajudar como voluntário
                    </a>
                </div>
            </div>
        </div>
        </section>
        </main>
    );
};

export default Contact;