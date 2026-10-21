/**
 * Design System: Reusable UI Primitives
 * Centralized component library following consistent design tokens
 */

import React from "react";
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimesCircle, FaCopy } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { MdChevronLeft, MdChevronRight, MdClose, MdKeyboardArrowUp, MdStar, MdStarBorder, MdVerified } from "react-icons/md";
import { GiHamburgerMenu } from "react-icons/gi";

/**
 * Button primitive - unified styling across the app
 */
export const Button = ({
    variant = "primary",
    size = "md",
    children,
    className = "",
    disabled = false,
    loading = false,
    fullWidth = false,
    ...props
}) => {
    const { type = "button", ...buttonProps } = props;
    const baseStyles =
        "inline-flex items-center justify-center rounded-lg font-semibold text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-600 disabled:opacity-50 disabled:cursor-not-allowed ";
    const variantStyles = {
        primary:
            "bg-primary-700 text-white hover:bg-primary-800 hover:shadow-md active:translate-y-px",
        secondary:
            "bg-neutral-800 text-white hover:bg-neutral-900 hover:shadow-md active:translate-y-px",
        outline:
            "border border-primary-700 text-primary-800 hover:bg-primary-50",
        ghost:
            "text-primary-800 hover:bg-primary-100",
        danger:
            "bg-danger-600 text-white hover:bg-danger-700 hover:shadow-md active:translate-y-px",
        success:
            "bg-success-800 text-white hover:bg-success-900 hover:shadow-md active:translate-y-px",
        link: "text-primary-500 hover:text-primary-600 underline-decoration-none underline-offset-2",
    };
    const sizeStyles = {
        xs: "px-2 py-1 text-xs gap-1",
        sm: "px-3 py-1.5 text-sm gap-1.5",
        md: "px-4 py-2 text-sm gap-2",
        lg: "px-5 py-2.5 text-base gap-2.5",
        xl: "px-6 py-3 text-base gap-2.5",
        full: "w-full",
    };
    return React.createElement("button", {
        className: `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? "w-full" : ""} ${className}`,
        disabled: disabled || loading,
        type,
        "aria-busy": loading || undefined,
        ...buttonProps
    }, [
        loading && React.createElement("span", {
            className: `w-4 h-4 border-2 ${variant === "ghost" || variant === "outline" || variant === "link" ? "border-current" : "border-white"} border-t-transparent rounded-full animate-spin`,
            "aria-hidden": true
        }),
        children
    ]);
};

/**
 * Card primitive - consistent card layout with subtle elevation
 */
export const Card = ({
    children,
    className = "",
    hover = false,
    shadow = "md",
    padded = true,
    ...props
}) => {
    const baseStyles = "bg-white rounded-2xl border border-neutral-200 transition-all duration-200 ";
    const hoverStyles = hover ? "hover:shadow-lg hover:border-primary-200 hover:-translate-y-0.5" : "";
    const shadowMap = {
        sm: "shadow-sm", md: "shadow-md", lg: "shadow-lg", xl: "shadow-xl",
        "2xl": "shadow-2xl", inner: "shadow-inner", none: "shadow-none",
    };
    const padding = padded ? "p-4 sm:p-5 lg:p-6" : "";
    return React.createElement("div", {
        className: `${baseStyles} ${hoverStyles} ${shadowMap[shadow] || shadowMap.md} ${padding} ${className}`,
        ...props
    }, children);
};

/**
 * Badge - semantic status indicators
 */
export const Badge = ({
    variant = "default",
    children,
    className = "",
    size = "md",
    ...props
}) => {
    const baseStyles = "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ";
    const variantStyles = {
        default: "bg-neutral-100 text-neutral-700",
        primary: "bg-primary-100 text-primary-700",
        success: "bg-success-100 text-success-700",
        warning: "bg-warning-100 text-warning-700",
        error: "bg-danger-100 text-danger-700",
        info: "bg-info-100 text-info-700",
    };
    const sizeClasses = { sm: "", md: "", lg: "text-base" };
    return React.createElement("span", {
        className: `${baseStyles} ${variantStyles[variant]} ${sizeClasses[size]} ${className}`,
        ...props
    }, children);
};

/**
 * Modal - accessible modal with focus trap and backdrop
 */
export const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    size = "md",
    className = "",
    ...props
}) => {
    if (!isOpen) return null;
    const sizeClasses = {
        sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg", xl: "max-w-xl",
        "2xl": "max-w-2xl", "3xl": "max-w-3xl", "4xl": "max-w-4xl", full: "max-w-full",
    };
    return React.createElement("div", {
        className: "fixed inset-0 z-50 flex items-center justify-center p-4",
        ...props
    }, [
        React.createElement("div", {
            className: "absolute inset-0 bg-black/50 backdrop-blur-sm",
            onClick: onClose
        }),
        React.createElement("div", {
            className: `bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} ${className}`,
            role: "dialog", "aria-modal": "true", "aria-label": title
        }, [
            title && React.createElement("div", {
                className: "flex items-center justify-between px-6 py-4 border-b border-neutral-200"
            }, [
                React.createElement("h2", { className: "text-xl font-bold text-neutral-900" }, title),
                React.createElement("button", {
                    onClick: onClose,
                    className: "p-2 hover:bg-neutral-100 rounded-lg transition-colors",
                    "aria-label": "Close modal"
                }, React.createElement("svg", {
                    className: "w-5 h-5 text-neutral-500", fill: "none", viewBox: "0 0 24 24",
                    stroke: "currentColor", strokeWidth: 2
                }, React.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M6 18L18 6M6 6l12 12" })))
            ]),
            React.createElement("div", { className: "px-6 py-4" }, children)
        ])
    ]);
};

/**
 * Input - unified form control with accessible focus rings and error states
 */
export const Input = ({
    label, error, success, className = "", ...props
}) => {
    const generatedId = React.useId();
    const id = props.id || generatedId;
    const feedbackId = `${id}-feedback`;
    const describedBy = [props["aria-describedby"], error || success ? feedbackId : null].filter(Boolean).join(" ") || undefined;
    const baseStyles =
        "w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm placeholder:text-neutral-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 bg-white ";
    const errorStyles = error ? "border-red-500 focus:ring-red-500/30" : "border-neutral-300 focus:ring-primary-500/30";
    const successStyles = success ? "border-success-500 focus:ring-success-500/30" : "";
    return React.createElement("div", { className: "w-full" }, [
        label && React.createElement("label", { htmlFor: id, className: "block text-sm font-medium text-neutral-700 mb-1.5" }, label),
        (error || success) && React.createElement("p", { id: feedbackId, className: `text-xs mb-1.5 flex items-center gap-1 ${error ? "text-danger-700" : "text-success-700"}` },
            error ? React.createElement(FaExclamationCircle) : React.createElement(FaCheckCircle), " ", error || success),
        React.createElement("input", { ...props, id, "aria-invalid": error ? "true" : undefined, "aria-describedby": describedBy, className: `${baseStyles} ${errorStyles} ${successStyles} ${className}` })
    ]);
};

/**
 * Textarea - unified form control
 */
export const Textarea = ({
    label, error, success, className = "", rows = 4, ...props
}) => {
    const generatedId = React.useId();
    const id = props.id || generatedId;
    const feedbackId = `${id}-feedback`;
    const describedBy = [props["aria-describedby"], error || success ? feedbackId : null].filter(Boolean).join(" ") || undefined;
    const baseStyles =
        "w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm placeholder:text-neutral-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 bg-white resize-y ";
    const errorStyles = error ? "border-red-500 focus:ring-red-500/30" : "border-neutral-300 focus:ring-primary-500/30";
    const successStyles = success ? "border-success-500 focus:ring-success-500/30" : "";
    return React.createElement("div", { className: "w-full" }, [
        label && React.createElement("label", { htmlFor: id, className: "block text-sm font-medium text-neutral-700 mb-1.5" }, label),
        (error || success) && React.createElement("p", { id: feedbackId, className: `text-xs mb-1.5 flex items-center gap-1 ${error ? "text-danger-700" : "text-success-700"}` },
            error ? React.createElement(FaExclamationCircle) : React.createElement(FaCheckCircle), " ", error || success),
        React.createElement("textarea", {
            ...props,
            id,
            "aria-invalid": error ? "true" : undefined,
            "aria-describedby": describedBy,
            className: `${baseStyles} ${errorStyles} ${successStyles} ${className}`,
            rows
        })
    ]);
};

/**
 * Select - unified form control
 */
export const Select = ({
    label, error, success, className = "", ...props
}) => {
    const generatedId = React.useId();
    const id = props.id || generatedId;
    const feedbackId = `${id}-feedback`;
    const describedBy = [props["aria-describedby"], error || success ? feedbackId : null].filter(Boolean).join(" ") || undefined;
    const baseStyles =
        "w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm placeholder:text-neutral-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 bg-white ";
    const errorStyles = error ? "border-red-500 focus:ring-red-500/30" : "border-neutral-300 focus:ring-primary-500/30";
    const successStyles = success ? "border-success-500 focus:ring-success-500/30" : "";
    return React.createElement("div", { className: "w-full" }, [
        label && React.createElement("label", { htmlFor: id, className: "block text-sm font-medium text-neutral-700 mb-1.5" }, label),
        (error || success) && React.createElement("p", { id: feedbackId, className: `text-xs mb-1.5 flex items-center gap-1 ${error ? "text-danger-700" : "text-success-700"}` },
            error ? React.createElement(FaExclamationCircle) : React.createElement(FaCheckCircle), " ", error || success),
        React.createElement("select", {
            ...props,
            id,
            "aria-invalid": error ? "true" : undefined,
            "aria-describedby": describedBy,
            className: `${baseStyles} ${errorStyles} ${successStyles} ${className}`
        }, props.children)
    ]);
};

/**
 * Spinner - loading indicator
 */
export const Spinner = ({ size = "md", className = "" }) => {
    const sizeClasses = {
        sm: "w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full",
        md: "w-6 h-6 border-3 border-primary-500 border-t-transparent rounded-full",
        lg: "w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full",
        xl: "w-10 h-10 border-3 border-primary-500 border-t-transparent rounded-full",
    };
    return React.createElement("span", {
        className: `animate-spin ${sizeClasses[size]} ${className}`,
        role: "status", "aria-label": "Loading"
    });
};

/**
 * Alert - informational/warning/error message with icon
 */
export const Alert = ({
    variant = "info", children, className = "", icon, dense = false
}) => {
    const variantStyles = {
        info: "bg-blue-50 border-blue-200 text-blue-800",
        success: "bg-emerald-50 border-emerald-200 text-emerald-800",
        warning: "bg-amber-50 border-amber-200 text-amber-800",
        error: "bg-red-50 border-red-200 text-red-800",
    };
    const iconMap = {
        info: FaInfoCircle, success: FaCheckCircle, warning: FaExclamationCircle, error: FaTimesCircle
    };
    const IconComponent = iconMap[variant];
    const denseClass = dense ? "p-3" : "p-4";
    return React.createElement("div", {
        className: `flex items-start gap-3 border rounded-xl ${variantStyles[variant]} ${denseClass} ${className}`
    }, [
        React.createElement("div", { className: "mt-0.5" }, icon || React.createElement(IconComponent, { className: "w-5 h-5" })),
        React.createElement("div", { className: "text-sm" }, children)
    ]);
};

/**
 * Skeleton - loading placeholder with shimmer animation
 */
export const Skeleton = ({ className = "", ...props }) => (
    React.createElement("div", { className: `animate-shimmer bg-white-200 rounded-lg ${className}`, ...props })
);
export const SkeletonBlock = ({ className = "" }) => (
    React.createElement("div", { className: `animate-shimmer bg-white-200 rounded ${className}` })
);
export const SkeletonText = ({ className = "", lines = 3 }) => {
    const heights = [6, 8, 10].slice(0, lines);
    return React.createElement("div", { className: `space-y-2 ${className}` }, heights.map((h, i) =>
        React.createElement("div", { key: i, className: `animate-shimmer bg-white-200 h-4 rounded ${h > 8 ? "w-48" : h > 6 ? "w-32" : "w-20"}` })
    ));
};

/**
 * EmptyState - informative empty state with optional action
 */
export const EmptyState = ({ icon, title, description, action }) => {
    return React.createElement("div", { className: "flex flex-col items-center justify-center py-12 px-4 text-center" }, [
        React.createElement("div", { className: "w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mb-4" },
            icon || React.createElement(FaInfoCircle, { className: "w-6 h-6 text-neutral-400" })),
        React.createElement("h3", { className: "text-lg font-semibold text-neutral-900 mb-1" }, title),
        React.createElement("p", { className: "text-sm text-neutral-600 max-w-md mb-4" }, description),
        action && React.createElement("div", { className: "mt-2" }, action)
    ]);
};

/**
 * Table - accessible data table with consistent styling
 */
export const DataTable = ({
    columns, data, loading = false, emptyMessage = "No data available",
    className = "", rowClassName, headerClassName = ""
}) => {
    if (loading) {
        return React.createElement("div", { className: "space-y-3" }, Array.from({ length: 5 }).map((_, i) =>
            React.createElement("div", { key: i, className: "animate-shimmer bg-white-200 h-12 rounded-lg" })
        ));
    }
    if (!data || data.length === 0) {
        return React.createElement(EmptyState, { title: "No data", description: emptyMessage });
    }
    return React.createElement("div", { className: `overflow-x-auto rounded-xl border border-neutral-200 ${className}` }, React.createElement("table", { className: "w-full text-sm" }, React.createElement("thead", { className: "bg-neutral-50 border-b border-neutral-200" }, columns.map((col) =>
        React.createElement("th", { key: col.key, className: "px-4 py-3 text-left font-semibold text-neutral-600 uppercase tracking-wider" }, col.header)
    )), React.createElement("tbody", {}, data.map((row, idx) =>
        React.createElement("tr", { key: row.id || idx, className: `border-b border-neutral-100 hover:bg-neutral-50 transition-colors ${rowClassName ? rowClassName(row) : ""}` }, columns.map((col) =>
            React.createElement("td", { key: col.key, className: "px-4 py-3 text-neutral-700" }, col.render ? col.render(row, col.key) : (row[col.key] || ""))
        )))
    )));
};

/**
 * ProgressBar - visual progress indicator
 */
export const ProgressBar = ({ value = 0, color = "primary", className = "", animate = true }) => {
    const colorMap = {
        primary: "bg-primary-500", success: "bg-success-500", warning: "bg-warning-500",
        danger: "bg-danger-500", info: "bg-info-500", neutral: "bg-neutral-400",
    };
    return React.createElement("div", { className: `w-full rounded-full h-2 bg-neutral-200 ${className}` }, React.createElement("div", {
        className: `${colorMap[color] || colorMap.primary} transition-all duration-animate-500 ${animate ? "" : ""}`,
        style: { width: `${Math.min(100, Math.max(0, value))}%` }
    }));
};

/**
 * Avatar - user profile image with fallback
 */
export const Avatar = ({ src, size = "md", alt = "", className = "", fallback = null }) => {
    const sizeClasses = {
        xs: "w-6 h-6", sm: "w-8 h-8", md: "w-10 h-10", lg: "w-12 h-12",
        xl: "w-16 h-16", "2xl": "w-24 h-24", "3xl": "w-32 h-32",
    };
    const srcString = src || "";
    return React.createElement("div", { className: "relative" }, [
        React.createElement("img", {
            src: srcString || (fallback ? `https://ui-avatars.com/api/?name=${encodeURIComponent(fallback)}&size=128&background=00ACBA&color=FFF` : ""),
            alt: alt || "avatar",
            className: `${sizeClasses[size]} rounded-full object-cover border-2 border-white shadow-sm ${className}`,
            loading: "lazy"
        }),
        !src && fallback && React.createElement("div", { className: "absolute inset-0 flex items-center justify-center text-white font-bold text-sm" }, fallback.charAt(0))
    ]);
};

/**
 * StatCard - metric card for dashboards with trend
 */
export const StatCard = ({
    title, value, icon, trend, trendUp = true, color = "primary",
    className = "", showBorder = true
}) => {
    const trendStyles = {
        positive: "text-success-800", negative: "text-danger-700", neutral: "text-neutral-600",
    };
    const colorMap = {
        primary: "bg-primary-100", success: "bg-success-100", warning: "bg-warning-100",
        danger: "bg-danger-100", info: "bg-info-100", neutral: "bg-neutral-100",
    };
    return React.createElement(Card, { className: `p-5 ${showBorder ? "border border-neutral-200" : ""} ${className}` }, React.createElement("div", { className: "flex items-start justify-between" }, [
        React.createElement("div", {}, [
            React.createElement("p", { className: "text-sm font-medium text-neutral-600 mb-1" }, title),
            React.createElement("p", { className: "text-2xl font-bold text-neutral-900" }, value)
        ]),
        icon && React.createElement("div", { className: `p-3 rounded-xl ${colorMap[color] || colorMap.neutral} text-${color}-600` }, icon)
    ]), trend && React.createElement("div", { className: `mt-3 flex items-center gap-1 text-xs ${trendStyles[trend?.up === false ? "negative" : trendUp ? "positive" : "neutral"]}` }, [
        React.createElement(FaCheckCircle), React.createElement("span", {}, trend?.label || "")
    ]));
};

/**
 * Toggle switch - interactive on/off control
 */
export const Toggle = ({ checked = false, onChange, label, disabled = false }) => {
    return React.createElement("label", { className: "flex items-center gap-3 cursor-pointer" }, [
        React.createElement("input", {
            type: "checkbox",
            className: "sr-only",
            checked: checked,
            onChange: onChange,
            disabled: disabled,
            id: label
        }),
        React.createElement("span", {
            className: `w-9 h-5 rounded-full transition-colors duration-200 relative ${checked ? "bg-primary-500" : "bg-neutral-300"}`,
            "aria-label": label
        }, [
            React.createElement("span", {
                className: `absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${checked ? "translate-x-4" : ""}`
            })
        ]),
        label && React.createElement("span", { className: "text-sm text-neutral-700" }, label)
    ]);
};

/**
 * Rating - interactive star rating component
 */
export const Rating = ({ value = 0, onChange, size = "md", readOnly = false }) => {
    const sizeClasses = { xs: "text-xs", sm: "text-sm", md: "text-lg", lg: "text-xl" };
    const StarIcon = readOnly ? MdStarBorder : MdStar;
    return React.createElement("div", { className: "flex items-center gap-1" }, Array.from({ length: 5 }, (_, i) =>
        React.createElement(StarIcon, {
            key: i,
            className: `${sizeClasses[size]} ${i < Math.round(value) ? "text-warning-400" : "text-neutral-300"} cursor-pointer transition-colors ${readOnly ? "cursor-default" : ""}`,
            onClick: readOnly ? undefined : () => onChange?.(i + 1),
            "aria-label": `Rating ${i + 1} star`
        })
    ));
};

/**
 * Switch - on/off toggle row component
 */
export const Switch = ({ label, checked, onChange, description, className = "" }) => {
    return React.createElement("label", { className: `flex items-center gap-3 p-3 rounded-xl border border-neutral-200 cursor-pointer ${className}` }, [
        React.createElement("input", {
            type: "checkbox",
            className: "sr-only",
            checked: checked,
            onChange: onChange,
            id: label
        }),
        React.createElement("span", {
            className: `w-14 h-8 rounded-full transition-colors duration-200 relative ${checked ? "bg-primary-500" : "bg-neutral-300"}`,
        }, [
            React.createElement("span", {
                className: `absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${checked ? "translate-x-5" : ""}`
            })
        ]),
        React.createElement("div", { className: "flex flex-col" }, [
            React.createElement("span", { className: "text-sm font-medium text-neutral-800" }, label),
            description && React.createElement("span", { className: "text-sm text-neutral-600" }, description)
        ])
    ]);
};

/**
 * Tabs - tabbed interface component
 */
export const Tabs = ({ tabs, activeTab, onChange, className = "" }) => {
    return React.createElement("div", { className: `space-y-2 ${className}` }, tabs.map((tab) =>
        React.createElement(Button, {
            key: tab.id,
            variant: activeTab === tab.id ? "primary" : "ghost",
            onClick: () => onChange(tab.id),
            className: activeTab === tab.id ? "rounded-xl bg-primary-500 text-white" : "rounded-xl"
        }, tab.label)
    ));
};

/**
 * ChatBubble - contextual chat message bubble
 */
export const ChatBubble = ({ message, isOwn, className = "" }) => {
    const base = isOwn ? "bg-primary-50 text-primary-900" : "bg-neutral-100 text-neutral-800";
    return React.createElement("div", { className: `flex ${isOwn ? "justify-end" : "justify-start"} mb-2` }, [
        React.createElement("div", { className: `max-w-xs md:max-w-md px-4 py-2 rounded-2xl rounded-tr-sm ${base} ${className}` }, [
            React.createElement("p", { className: "text-sm" }, message)
        ])
    ]);
};

/**
 * CardAction - ghost action button for cards
 */
export const CardAction = ({ variant = "ghost", icon, label, onClick, color = "primary" }) => {
    const colorMap = {
        primary: "text-primary-500 hover:bg-primary-500/10",
        success: "text-success-800 hover:bg-success-100",
        warning: "text-warning-700 hover:bg-warning-100",
        danger: "text-danger-500 hover:bg-danger-500/10",
        info: "text-info-700 hover:bg-info-100",
    };
    return React.createElement(Button, {
        variant: "ghost", size: "sm", onClick: onClick,
        className: `p-2 ${colorMap[color] || colorMap.primary}`
    }, icon);
};

/**
 * CollapsibleSection - accordion-like expandable section
 */
export const CollapsibleSection = ({ title, children, defaultOpen = false, className = "" }) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);
    return React.createElement("div", { className: `border border-neutral-200 rounded-xl ${className}` }, [
        React.createElement("button", {
            className: "w-full flex items-center justify-between p-4 text-left hover:bg-neutral-50 transition-colors",
            onClick: () => setIsOpen(!isOpen)
        }, [
            React.createElement("span", { className: "font-semibold text-neutral-800" }, title),
            React.createElement("span", { className: `text-primary-500 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}` }, React.createElement(MdChevronRight, { className: "w-5 h-5" }))
        ]),
        React.createElement("div", { className: `overflow-hidden transition-all duration-200 ${isOpen ? "max-h-96" : "max-h-0"}` }, children)
    ]);
};

/**
 * Pagination - page navigation control
 */
export const Pagination = ({ currentPage, totalPages, onPageChange, className = "" }) => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
    }
    if (totalPages <= 7) {
        return React.createElement("div", { className: `flex items-center justify-center gap-1 ${className}` }, pages.map((p) =>
            React.createElement(Button, {
                key: p, variant: p === currentPage ? "primary" : "ghost", size: "sm",
                onClick: () => onPageChange(p)
            }, p)
        ));
    }
    return React.createElement("div", { className: `flex items-center justify-center gap-1 ${className}` }, [
        React.createElement(Button, { variant: "ghost", size: "sm", onClick: () => onPageChange(currentPage - 1), disabled: currentPage <= 1 },
            React.createElement(MdChevronLeft, { className: "w-4 h-4" })),
        React.createElement(MdChevronLeft, { className: "w-4 h-4" }),
        React.createElement(Button, { variant: "ghost", size: "sm", onClick: () => onPageChange(1) }, "1"),
        React.createElement("span", { className: "font-medium text-neutral-600" }, "..."),
        React.createElement(Button, { variant: "ghost", size: "sm", onClick: () => onPageChange(totalPages) }, totalPages),
        React.createElement(MdChevronRight, { className: "w-4 h-4" }),
        React.createElement(Button, { variant: "ghost", size: "sm", onClick: () => onPageChange(currentPage + 1), disabled: currentPage >= totalPages },
            React.createElement(MdChevronRight, { className: "w-4 h-4" }))
    ]);
};

/**
 * Toast - custom toast notification
 */
export const Toast = ({ message, type = "info", duration = 4000, onClose }) => {
    const typeStyles = {
        success: "bg-success-50 border-success-200 text-success-800",
        error: "bg-danger-50 border-danger-200 text-danger-800",
        warning: "bg-amber-50 border-amber-200 text-amber-800",
        info: "bg-blue-50 border-blue-200 text-blue-800",
    };
    const Icon = {
        success: FaCheckCircle, error: FaTimesCircle, warning: FaExclamationCircle, info: FaInfoCircle
    };
    return React.createElement("div", {
        className: `flex items-start gap-3 p-4 border rounded-xl shadow-lg animate-slide-in ${typeStyles[type] || typeStyles.info}`,
        role: "alert"
    }, [
        React.createElement("div", { className: "mt-0.5" }, React.createElement(Icon[type] || FaInfoCircle, { className: "w-5 h-5" })),
        React.createElement("div", { className: "flex-1 text-sm" }, message),
        React.createElement("button", {
            onClick: onClose,
            className: "text-current hover:text-current"
        }, React.createElement(MdClose, { className: "w-4 h-4" }))
    ]);
};

/**
 * ImageUpload - custom file upload with preview
 */
export const ImageUpload = ({ value, onChange, label, multiple = false, accept = ".jpg,.png,.jpeg,.webp" }) => {
    const [preview, setPreview] = React.useState(value || []);
    const [dragOver, setDragOver] = React.useState(false);

    const handleFiles = (files) => {
        const fileArray = Array.from(files || []);
        if (multiple) {
            const newFiles = [...preview, ...fileArray].slice(0, 9);
            onChange(newFiles);
            setPreview(newFiles);
        } else if (fileArray[0]) {
            onChange(fileArray[0]);
            setPreview(fileArray[0]);
        }
    };

    const inputRef = React.useRef(null);
    const handleClick = () => inputRef.current.click();

    return React.createElement("div", { className: "flex flex-col items-center gap-2" }, [
        React.createElement("input", {
            ref: inputRef,
            type: "file",
            accept: accept,
            multiple: multiple,
            style: "display: none",
            onChange: (e) => handleFiles(e.target.files),
            multiple: multiple
        }),
        React.createElement("div", {
            className: `w-full border-2 border-dashed border-neutral-300 rounded-xl p-6 text-center cursor-pointer transition-all duration-200 hover:border-primary-400 hover:bg-primary-50/50 ${dragOver ? "border-primary-500 bg-primary-50" : ""}`,
            onClick: handleClick,
            onDragOver: (e) => { e.preventDefault(); setDragOver(true); },
            onDragLeave: () => setDragOver(false),
            onDrop: (e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }
        }, [
            preview && !Array.isArray(preview) ? React.createElement("img", { src: URL.createObjectURL(preview), alt: "preview", className: "w-20 h-20 rounded-lg object-cover mx-auto" }) : null,
            !preview ? React.createElement("span", { className: "text-primary-500 mb-2" }, React.createElement(GiHamburgerMenu, { className: "w-8 h-8" })) : null,
            !preview ? React.createElement("span", { className: "text-sm font-medium text-neutral-700" }, "Drag & drop files here or click to upload") : null,
            Array.isArray(preview) && preview.length > 0 ? React.createElement("div", { className: "flex flex-wrap gap-2 justify-center" }, preview.map((f, i) =>
                React.createElement("img", { key: i, src: URL.createObjectURL(f), alt: `preview-${i}`, className: "w-12 h-12 rounded-lg border border-neutral-200" })
            )) : null
        ])
    ]);
};

/**
 * Img - image with fallback
 */
const Img = ({ src, alt, className = "" }) => {
    return React.createElement("img", { src: src, alt: alt, className: className });
};

/**
 * FloatingLabelInput - input with floating label animation
 */
export const FloatingLabelInput = ({ label, error, success, className = "", ...props }) => {
    const [focused, setFocused] = React.useState(false);
    const baseStyles =
        "w-full px-4 py-3 border border-neutral-300 rounded-xl text-sm placeholder:text-neutral-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 bg-white ";
    const errorStyles = error ? "border-red-500 focus:ring-red-500/30" : "border-neutral-300 focus:ring-primary-500/30";
    const successStyles = success ? "border-success-500 focus:ring-success-500/30" : "";
    return React.createElement("div", { className: "relative mb-4" }, [
        React.createElement("input", {
            className: `${baseStyles} ${focused || error || success ? "p-3" : "py-2.5"} ${errorStyles} ${successStyles} ${className}`,
            onFocus: () => setFocused(true),
            onBlur: () => setFocused(false),
            ...props
        }),
        React.createElement("label", {
            className: `absolute left-3 top-1/2 -translate-y-1/2 transition-all duration-200 ${focused || error || success ? "text-xs text-neutral-600 -top-4" : "text-sm text-neutral-600"}`
        }, label),
        error && React.createElement("p", { className: "text-sm font-medium text-danger-700 mt-1 flex items-center gap-1" },
            React.createElement(FaExclamationCircle), " ", error),
        success && React.createElement("p", { className: "text-sm font-medium text-success-700 mt-1 flex items-center gap-1" },
            React.createElement(FaCheckCircle), " ", success)
    ]);
};

/**
 * StepIndicator - multi-step progress indicator
 */
export const StepIndicator = ({ steps, activeStep, className = "" }) => {
    return React.createElement("div", { className: `flex items-center gap-2 ${className}` }, steps.map((step, i) =>
        React.createElement("div", { key: i, className: "flex items-center gap-2" }, [
            React.createElement("div", {
                className: `w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                    i <= activeStep ? "border-primary-700 bg-primary-700 text-white" : "border-neutral-400 text-neutral-600"
                }`
            }, step.completed ? React.createElement(FaCheckCircle, { className: "w-4 h-4" }) : i + 1),
            React.createElement("span", {
                className: `text-sm ${i < activeStep ? "text-neutral-700 font-medium" : "text-neutral-600"}`
            }, step.label)
        ])
    ));
};

/**
 * CopyToClipboard - copy functionality button
 */
export const CopyToClipboard = ({ value, className = "" }) => {
    const [copied, setCopied] = React.useState(false);
    const handleCopy = async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return React.createElement(Button, { variant: "ghost", size: "sm", onClick: handleCopy, className: `gap-1 ${className}` },
        copied ? React.createElement(FaCheckCircle, { className: "w-4 h-4 text-success-700" }) : React.createElement(FaCopy, { className: "w-4 h-4 text-neutral-600" }),
        copied ? "Copied" : "Copy"
    );
};

/**
 * ConfirmDialog - reusable confirmation dialog
 */
export const ConfirmDialog = ({
    isOpen, onClose, onConfirm, title = "Confirm Action",
    message = "Are you sure?", confirmLabel = "Confirm", cancelLabel = "Cancel",
    confirmColor = "danger", loading = false
}) => {
    return React.createElement(Modal, { isOpen: isOpen, onClose: onClose, title: null },
        React.createElement("div", { className: "p-6" }, [
            React.createElement("h3", { className: "text-lg font-bold text-neutral-900 mb-2" }, title),
            React.createElement("p", { className: "text-sm text-neutral-600 mb-6" }, message),
            React.createElement("div", { className: "flex gap-3 justify-end" }, [
                React.createElement(Button, { variant: "outline", onClick: onClose }, cancelLabel),
                React.createElement(Button, { variant: "danger", loading: loading, onClick: onConfirm }, confirmLabel)
            ])
        ])
    );
};

/**
 * SearchInput - search field with clear and icon
 */
export const SearchInput = ({ value, onChange, placeholder = "Search...", className = "" }) => {
    const [focused, setFocused] = React.useState(false);
    const icon = React.createElement(MdChevronRight, { className: "w-4 h-4 text-neutral-400" });
    return React.createElement("div", { className: "relative" }, [
        React.createElement("input", {
            type: "text",
            value: value,
            onChange: (e) => onChange(e.target.value),
            placeholder: placeholder,
            className: `w-full pl-10 pr-10 py-2.5 border border-neutral-300 rounded-xl text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 bg-white/90 ${
                focused ? "border-primary-500" : ""
            } ${className}`,
            onFocus: () => setFocused(true),
            onBlur: () => setFocused(false),
        }),
        React.createElement("span", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" }, icon),
        value && React.createElement("button", {
            type: "button",
            onClick: () => onChange(""),
            "aria-label": "Clear search",
            className: "absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
        }, React.createElement(FaTimesCircle, { className: "w-4 h-4" }))
    ]);
};

/**
 * WaveSection - decorative wave divider for section separation
 */
export const WaveSection = ({ color = "#00ACBA", height = 60 }) => {
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 60" preserveAspectRatio="none">
            <path fill="${color}" d="M0,60 L60,54 C120,49,240,40,360,36 C480,32,600,32,720,40 C840,48,960,60,1080,56 C1200,52,1320,40,1380,32 L1440,24 L1440,60 L0,60 Z" />
        </svg>
    `;
    return React.createElement("div", { className: "overflow-hidden" }, [
        React.createElement("div", { className: "w-full h-1/2 bg-gradient-to-t from-white to-transparent" }),
        React.createElement("div", { className: "w-full" }, React.createElement("svg", { width: "100%", height: height, viewBox: "0 0 1440 60", preserveAspectRatio: "none", xmlns: "http://www.w3.org/2000/svg" }, React.createElement("path", { d: "M0,60 L60,54 C120,49,240,40,360,36 C480,32,600,32,720,40 C840,48,960,60,1080,56 C1200,52,1320,40,1440,32 L1440,60 L0,60 Z", fill: color })))
    ]);
};

/**
 * BackToTop - scroll-to-top button
 */
export const BackToTop = ({ visible = true }) => {
    const [isVisible, setIsVisible] = React.useState(visible);
    React.useEffect(() => {
        const handleScroll = () => {
            setIsVisible(window.scrollY > 300);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);
    if (!isVisible) return null;
    return React.createElement(Button, {
        variant: "primary", size: "lg",
        onClick: () => window.scrollTo({ top: 0, behavior: "smooth" }),
        className: "fixed bottom-6 right-6 z-40 p-3 bg-primary-500 hover:bg-primary-600 rounded-full shadow-lg"
    }, React.createElement(MdKeyboardArrowUp, { className: "w-5 h-5 text-white" }));
};

/**
 * SocialProof - social proof indicators (e.g., "Trusted by")
 */
export const SocialProof = ({ items = ["Trustpilot", "G2", "Capterra", "Product Hunt"], className = "" }) => {
    return React.createElement("div", { className: `flex items-center gap-4 ${className}` }, items.map((item, i) =>
        React.createElement("div", { key: i, className: "flex items-center gap-1 text-sm text-neutral-600" }, [
            React.createElement(MdVerified, { className: "w-3 h-3 text-primary-400" }),
            item
        ])
    ));
};

/**
 * LoadingOverlay - full-screen background loading overlay
 */
export const LoadingOverlay = ({ isLoading = true, overlayClassName = "", children }) => {
    if (!isLoading) return children;
    return React.createElement("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm" }, [
        React.createElement("div", { className: "flex flex-col items-center gap-4" }, [
            React.createElement(Spinner, { size: "xl" }),
            React.createElement("p", { className: "text-neutral-600" }, "Loading...")
        ])
    ]);
};
