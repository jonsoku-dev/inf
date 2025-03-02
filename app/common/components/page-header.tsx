import React from "react";

interface PageHeaderProps {
    title: string;
    description?: string;
    actions?: React.ReactNode;
}

/**
 * 페이지 상단에 표시되는 제목과 설명을 포함하는 헤더 컴포넌트
 */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                {description && (
                    <p className="text-sm text-muted-foreground">{description}</p>
                )}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
    );
} 