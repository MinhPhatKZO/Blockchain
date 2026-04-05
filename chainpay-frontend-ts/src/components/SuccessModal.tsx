import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaArrowRight, FaCheckCircle, FaTimes } from 'react-icons/fa';

import { commonText } from '../text';

interface SuccessModalProps {
    isOpen: boolean;
    title: string;
    content: React.ReactNode;
    actionLabel: string;
    onAction: () => void;
    onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
    isOpen,
    title,
    content,
    actionLabel,
    onAction,
    onClose
}) => {
    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const { body } = document;
        const previousOverflow = body.style.overflow;
        body.style.overflow = 'hidden';

        return () => {
            body.style.overflow = previousOverflow;
        };
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    return createPortal(
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 py-8 sm:px-6">
            <div className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-lg overflow-hidden rounded-[32px] border border-white/60 bg-white shadow-2xl shadow-slate-900/20">
                <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-br from-emerald-200 via-emerald-100 to-white" />
                <div className="absolute right-[-40px] top-[-30px] h-36 w-36 rounded-full bg-emerald-300/25 blur-3xl" />
                <div className="absolute left-[-20px] bottom-[-60px] h-44 w-44 rounded-full bg-[#6C5CE7]/10 blur-3xl" />

                <div className="relative p-6 sm:p-8">
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label={commonText.actions.closeAria}
                        className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/90 text-slate-400 transition-colors hover:text-slate-700"
                    >
                        <FaTimes size={14} />
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-emerald-500 text-white shadow-lg shadow-emerald-500/25">
                            <FaCheckCircle size={28} />
                        </div>

                        <div>
                            <div className="text-xs font-black uppercase tracking-[0.3em] text-emerald-500">{commonText.modal.successBadge}</div>
                            <h3 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">{title}</h3>
                        </div>
                    </div>

                    <div className="mt-8 rounded-[28px] border border-slate-200 bg-slate-50/90 p-5 text-base leading-8 text-slate-600 sm:p-6 sm:text-lg">
                        {content}
                    </div>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <button
                            type="button"
                            onClick={onAction}
                            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] px-5 py-4 text-sm font-black text-white shadow-lg shadow-[#6C5CE7]/25 transition-transform hover:-translate-y-0.5"
                        >
                            {actionLabel}
                            <FaArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default SuccessModal;
