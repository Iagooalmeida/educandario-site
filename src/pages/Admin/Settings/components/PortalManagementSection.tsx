import React, { useState } from 'react';
import { AlertCircle, Check } from 'lucide-react';
import { usePortalSettingsContext } from '@/contexts/PortalSettingsContext';
import { useAuditLogs } from '@/hooks/useAuditLogs';

const PortalManagementSection: React.FC = () => {
    const { settings: portalSettings, error: portalError, updateSettings, clearError: clearPortalError } = usePortalSettingsContext();
    const { fetchLogs } = useAuditLogs();

    const [editingPortal, setEditingPortal] = useState(false);
    const [portalSuccess, setPortalSuccess] = useState(false);
    const [editingPortalData, setEditingPortalData] = useState({
        description: portalSettings?.description || '',
        website: portalSettings?.website || '',
        phone: portalSettings?.phone || '',
        email: portalSettings?.email || '',
        phone2: portalSettings?.phone2 || '',
        address: portalSettings?.address || '',
        instagram: portalSettings?.instagram || '',
        instagramHandle: portalSettings?.instagramHandle || '',
        facebook: portalSettings?.facebook || '',
        facebookHandle: portalSettings?.facebookHandle || '',
        pixKey: portalSettings?.pixKey || '',
        urgentNeedTitle: portalSettings?.urgentNeedTitle || '',
        urgentNeedDescription: portalSettings?.urgentNeedDescription || '',
        urgentNeedWindow: portalSettings?.urgentNeedWindow || '',
        urgentNeedDelivery: portalSettings?.urgentNeedDelivery || ''
    });

    const extractInstagramUsername = (input: string): string => {
        if (!input) return '';
        input = input.trim();
        if (input.includes('instagram.com')) {
            const match = input.match(/instagram\.com\/([^/?\s]+)/);
            return match ? match[1] : input;
        }
        return input.replace('@', '').trim();
    };

    const extractFacebookUsername = (input: string): string => {
        if (!input) return '';
        input = input.trim();
        if (input.includes('facebook.com') || input.includes('fb.com')) {
            const match = input.match(/facebook\.com\/([^/?\s]+)|fb\.com\/([^/?\s]+)/);
            return match ? (match[1] || match[2]) : input;
        }
        return input.replace('@', '').trim();
    };

    const handlePortalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditingPortalData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSavePortal = async () => {
        if (!editingPortalData.description.trim()) {
            // A descrição é obrigatória
            return;
        }
        
        try {
            clearPortalError();
            const instagramUsername = extractInstagramUsername(editingPortalData.instagram);
            const facebookUsername = extractFacebookUsername(editingPortalData.facebook);
            
            await updateSettings({
                description: editingPortalData.description,
                website: editingPortalData.website,
                phone: editingPortalData.phone,
                email: editingPortalData.email,
                phone2: editingPortalData.phone2,
                address: editingPortalData.address,
                instagram: instagramUsername,
                instagramHandle: editingPortalData.instagramHandle,
                facebook: facebookUsername,
                facebookHandle: editingPortalData.facebookHandle,
                pixKey: editingPortalData.pixKey,
                urgentNeedTitle: editingPortalData.urgentNeedTitle,
                urgentNeedDescription: editingPortalData.urgentNeedDescription,
                urgentNeedWindow: editingPortalData.urgentNeedWindow,
                urgentNeedDelivery: editingPortalData.urgentNeedDelivery
            });
            await fetchLogs();
            setPortalSuccess(true);
            setTimeout(() => setPortalSuccess(false), 3000);
            setEditingPortal(false);
        } catch (error) {
            // Erro ao salvar configurações do portal
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-all hover:shadow-md">
            {/* Header */}
            <div className="p-4 sm:p-6 lg:p-8 border-b border-slate-100 dark:border-slate-800/50 bg-linear-to-r from-purple-50/50 to-pink-50/50 dark:from-slate-900/50 dark:to-slate-800/50">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 sm:p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl sm:rounded-2xl">
                        <AlertCircle className="text-purple-600 dark:text-purple-400" size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Gestão do Portal</h2>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Configure metadados públicos</p>
                    </div>
                </div>
            </div>

            {/* Conteúdo */}
            <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
                {editingPortal ? (
                    <>
                        {/* Descrição */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Descrição da Instituição</label>
                            <textarea
                                name="description"
                                value={editingPortalData.description}
                                onChange={handlePortalChange}
                                rows={4}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                                placeholder="Descrição da instituição..."
                            />
                        </div>

                        {/* Seção: Informações de Contato */}
                        <div className="border-t border-slate-200 dark:border-slate-700/50 mt-6 pt-6">
                            <div className="p-4 sm:p-5 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-r-lg mb-4">
                                <h3 className="text-sm font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                                    <span className="text-lg">📞</span> Informações de Contato
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                                {/* Website */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Website</label>
                                    <input
                                        type="url"
                                        name="website"
                                        value={editingPortalData.website}
                                        onChange={handlePortalChange}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        placeholder="https://..."
                                    />
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">E-mail</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={editingPortalData.email}
                                        onChange={handlePortalChange}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        placeholder="email@example.com"
                                    />
                                </div>

                                {/* Telefone Fixo */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Telefone Fixo</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={editingPortalData.phone}
                                        onChange={handlePortalChange}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        placeholder="(11) 0000-0000"
                                    />
                                </div>

                                {/* WhatsApp/Celular */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">WhatsApp / Celular</label>
                                    <input
                                        type="tel"
                                        name="phone2"
                                        value={editingPortalData.phone2}
                                        onChange={handlePortalChange}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        placeholder="(19) 0000-0000"
                                    />
                                </div>

                                {/* Endereço - Full Width */}
                                <div className="col-span-1 sm:col-span-2 space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Endereço</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={editingPortalData.address}
                                        onChange={handlePortalChange}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        placeholder="Rua..., Número - Cidade/Estado"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Seção: Redes Sociais */}
                        <div className="border-t border-slate-200 dark:border-slate-700/50 mt-6 pt-6">
                            <div className="p-4 sm:p-5 bg-linear-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border-l-4 border-pink-500 rounded-r-lg mb-4">
                                <h3 className="text-sm font-bold text-pink-900 dark:text-pink-100 flex items-center gap-2">
                                    <span className="text-lg">📱</span> Redes Sociais
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                                {/* Instagram */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Instagram - URL</label>
                                    <input
                                        type="text"
                                        name="instagram"
                                        value={editingPortalData.instagram}
                                        onChange={handlePortalChange}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                                        placeholder="https://instagram.com/usuario"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Instagram - Nome de Exibição</label>
                                    <input
                                        type="text"
                                        name="instagramHandle"
                                        value={editingPortalData.instagramHandle}
                                        onChange={handlePortalChange}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                                        placeholder="@usuario"
                                    />
                                </div>

                                {/* Facebook */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Facebook - URL</label>
                                    <input
                                        type="text"
                                        name="facebook"
                                        value={editingPortalData.facebook}
                                        onChange={handlePortalChange}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                                        placeholder="https://www.facebook.com/usuario"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Facebook - Nome de Exibição</label>
                                    <input
                                        type="text"
                                        name="facebookHandle"
                                        value={editingPortalData.facebookHandle}
                                        onChange={handlePortalChange}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                                        placeholder="@usuario"
                                    />
                                </div>

                                {/* PIX - Full Width */}
                                <div className="col-span-1 sm:col-span-2 space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">PIX</label>
                                    <input
                                        type="text"
                                        name="pixKey"
                                        value={editingPortalData.pixKey}
                                        onChange={handlePortalChange}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                                        placeholder="chave-pix@example.com ou CPF/CNPJ"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Seção: Necessidade Urgente */}
                        <div className="border-t border-slate-200 dark:border-slate-700/50 mt-6 pt-6">
                            <div className="p-4 sm:p-5 bg-linear-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-l-4 border-red-500 rounded-r-lg mb-4">
                                <h3 className="text-sm font-bold text-red-900 dark:text-red-100 flex items-center gap-2">
                                    <span className="text-lg">🚨</span> Necessidade Urgente Atual
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                                {/* Título da Necessidade */}
                                <div className="col-span-1 sm:col-span-2 space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Título</label>
                                    <input
                                        type="text"
                                        name="urgentNeedTitle"
                                        value={editingPortalData.urgentNeedTitle}
                                        onChange={handlePortalChange}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                                        placeholder="Título da necessidade urgente..."
                                    />
                                </div>

                                {/* Descrição */}
                                <div className="col-span-1 sm:col-span-2 space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Descrição</label>
                                    <textarea
                                        name="urgentNeedDescription"
                                        value={editingPortalData.urgentNeedDescription}
                                        onChange={handlePortalChange}
                                        rows={2}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all resize-none"
                                        placeholder="Descrição detalhada da necessidade..."
                                    />
                                </div>

                                {/* Janela de Entrega */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Janela de Entrega</label>
                                    <input
                                        type="text"
                                        name="urgentNeedWindow"
                                        value={editingPortalData.urgentNeedWindow}
                                        onChange={handlePortalChange}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                                        placeholder="Ex: 10 a 13/03, 8h às 16h"
                                    />
                                </div>

                                {/* Local de Entrega */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Local de Entrega</label>
                                    <input
                                        type="text"
                                        name="urgentNeedDelivery"
                                        value={editingPortalData.urgentNeedDelivery}
                                        onChange={handlePortalChange}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                                        placeholder="Endereço para entrega dessa necessidade..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Botões de Ação */}
                        <div className="flex gap-3 pt-4 sm:pt-6 border-t border-slate-100 dark:border-slate-800/50">
                            <button
                                onClick={() => {
                                    setEditingPortal(false);
                                    setEditingPortalData({
                                        description: portalSettings?.description || '',
                                        website: portalSettings?.website || '',
                                        phone: portalSettings?.phone || '',
                                        email: portalSettings?.email || '',
                                        phone2: portalSettings?.phone2 || '',
                                        address: portalSettings?.address || '',
                                        instagram: portalSettings?.instagram || '',
                                        instagramHandle: portalSettings?.instagramHandle || '',
                                        facebook: portalSettings?.facebook || '',
                                        facebookHandle: portalSettings?.facebookHandle || '',
                                        pixKey: portalSettings?.pixKey || '',
                                        urgentNeedTitle: portalSettings?.urgentNeedTitle || '',
                                        urgentNeedDescription: portalSettings?.urgentNeedDescription || '',
                                        urgentNeedWindow: portalSettings?.urgentNeedWindow || '',
                                        urgentNeedDelivery: portalSettings?.urgentNeedDelivery || ''
                                    });
                                }}
                                className="flex-1 px-4 py-2.5 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg font-medium text-sm transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSavePortal}
                                className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2"
                            >
                                <Check size={16} />
                                Salvar Portal
                            </button>
                        </div>

                        {/* Erro do Portal */}
                        {portalError && (
                            <div className="p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg">
                                <p className="text-xs sm:text-sm font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
                                    <AlertCircle size={16} />
                                    {portalError}
                                </p>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {/* Visualização */}
                        <div className="space-y-5 sm:space-y-6">
                            {/* Descrição */}
                            <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold mb-2 uppercase tracking-wide">Descrição da Instituição</p>
                                <p className="text-sm sm:text-base text-slate-900 dark:text-white leading-relaxed">{portalSettings?.description || 'N/A'}</p>
                            </div>

                            {/* Card: Informações de Contato */}
                            <div className="border border-blue-200 dark:border-blue-800/30 rounded-xl overflow-hidden">
                                <div className="p-4 sm:p-5 bg-linear-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20 border-b border-blue-200 dark:border-blue-800/30">
                                    <h3 className="text-sm font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                                        <span className="text-lg">📞</span> Informações de Contato
                                    </h3>
                                </div>
                                <div className="p-4 sm:p-5 space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg">
                                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold">Website:</p>
                                        <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate ml-2">{portalSettings?.website || 'N/A'}</p>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg">
                                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold">Email:</p>
                                        <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate ml-2">{portalSettings?.email || 'N/A'}</p>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg">
                                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold">Telefone:</p>
                                        <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">{portalSettings?.phone || 'N/A'}</p>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg">
                                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold">WhatsApp:</p>
                                        <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">{portalSettings?.phone2 || 'N/A'}</p>
                                    </div>
                                    <div className="flex items-start justify-between p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg gap-3">
                                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold shrink-0">Endereço:</p>
                                        <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white text-right">{portalSettings?.address || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Card: Redes Sociais */}
                            <div className="border border-pink-200 dark:border-pink-800/30 rounded-xl overflow-hidden">
                                <div className="p-4 sm:p-5 bg-linear-to-r from-pink-50 to-rose-50/50 dark:from-pink-900/20 dark:to-rose-900/20 border-b border-pink-200 dark:border-pink-800/30">
                                    <h3 className="text-sm font-bold text-pink-900 dark:text-pink-100 flex items-center gap-2">
                                        <span className="text-lg">📱</span> Redes Sociais
                                    </h3>
                                </div>
                                <div className="p-4 sm:p-5 space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-pink-50/50 dark:bg-pink-900/10 rounded-lg">
                                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold">Instagram:</p>
                                        <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate ml-2">{portalSettings?.instagramHandle || portalSettings?.instagram || 'N/A'}</p>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-pink-50/50 dark:bg-pink-900/10 rounded-lg">
                                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold">Facebook:</p>
                                        <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate ml-2">{portalSettings?.facebookHandle || portalSettings?.facebook || 'N/A'}</p>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-pink-50/50 dark:bg-pink-900/10 rounded-lg">
                                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold">PIX:</p>
                                        <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate ml-2">{portalSettings?.pixKey || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Card: Necessidade Urgente */}
                            {(portalSettings?.urgentNeedTitle || portalSettings?.urgentNeedDescription) && (
                                <div className="border-2 border-red-300 dark:border-red-700/50 rounded-xl overflow-hidden bg-linear-to-b from-red-50/30 to-transparent dark:from-red-900/10 dark:to-transparent">
                                    <div className="p-4 sm:p-5 bg-linear-to-r from-red-100 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30 border-b border-red-200 dark:border-red-800/30">
                                        <h3 className="text-sm font-bold text-red-900 dark:text-red-100 flex items-center gap-2">
                                            <span className="text-lg">🚨</span> Necessidade Urgente Atual
                                        </h3>
                                    </div>
                                    <div className="p-4 sm:p-5 space-y-4">
                                        {portalSettings?.urgentNeedTitle && (
                                            <div>
                                                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wide mb-1">Título</p>
                                                <p className="text-sm sm:text-base font-bold text-red-700 dark:text-red-200">{portalSettings.urgentNeedTitle}</p>
                                            </div>
                                        )}
                                        {portalSettings?.urgentNeedDescription && (
                                            <div>
                                                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wide mb-1">Descrição</p>
                                                <p className="text-sm sm:text-base text-slate-900 dark:text-white leading-relaxed">{portalSettings.urgentNeedDescription}</p>
                                            </div>
                                        )}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {portalSettings?.urgentNeedWindow && (
                                                <div className="p-3 bg-red-100/40 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800/30">
                                                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold mb-1">Janela de Entrega</p>
                                                    <p className="text-xs sm:text-sm text-slate-900 dark:text-white font-semibold">{portalSettings.urgentNeedWindow}</p>
                                                </div>
                                            )}
                                            {portalSettings?.urgentNeedDelivery && (
                                                <div className="p-3 bg-red-100/40 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800/30">
                                                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold mb-1">Local de Entrega</p>
                                                    <p className="text-xs sm:text-sm text-slate-900 dark:text-white font-semibold">{portalSettings.urgentNeedDelivery}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sucesso do Portal */}
                        {portalSuccess && (
                            <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-lg">
                                <p className="text-xs sm:text-sm font-semibold text-green-700 dark:text-green-400 flex items-center gap-2">
                                    <Check size={16} />
                                    Configurações do portal atualizadas com sucesso!
                                </p>
                            </div>
                        )}

                        {/* Botão de Edição */}
                        <button
                            onClick={() => {
                                setEditingPortalData({
                                    description: portalSettings?.description || '',
                                    website: portalSettings?.website || '',
                                    phone: portalSettings?.phone || '',
                                    email: portalSettings?.email || '',
                                    phone2: portalSettings?.phone2 || '',
                                    address: portalSettings?.address || '',
                                    instagram: portalSettings?.instagram || '',
                                    instagramHandle: portalSettings?.instagramHandle || '',
                                    facebook: portalSettings?.facebook || '',
                                    facebookHandle: portalSettings?.facebookHandle || '',
                                    pixKey: portalSettings?.pixKey || '',
                                    urgentNeedTitle: portalSettings?.urgentNeedTitle || '',
                                    urgentNeedDescription: portalSettings?.urgentNeedDescription || '',
                                    urgentNeedWindow: portalSettings?.urgentNeedWindow || '',
                                    urgentNeedDelivery: portalSettings?.urgentNeedDelivery || ''
                                });
                                setEditingPortal(true);
                            }}
                            className="w-full px-4 py-2.5 text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg font-medium text-sm transition-colors"
                        >
                            Editar Portal
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default PortalManagementSection;
