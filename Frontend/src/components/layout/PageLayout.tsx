import { ReactNode } from 'react';

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
}

const PageLayout = ({ children, className = '' }: PageLayoutProps) => {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-950 via-gray-800/50 to-gray-900 text-white ${className}`}>
      {/* Subtle dot pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2260%22%20height=%2260%22%20viewBox=%220%200%2060%2060%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%23ffffff%22%20fill-opacity=%220.03%22%3E%3Ccircle%20cx=%2230%22%20cy=%2230%22%20r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] animate-pulse pointer-events-none"></div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default PageLayout;
