import Sidebar from './Sidebar';

export default function MarketsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Sidebar />
      <div className="main">
        {children}
      </div>
    </>
  );
}
