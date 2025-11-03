export default function Modal({title, children, onClose, actions}:{title:string, children:React.ReactNode, onClose:()=>void, actions:React.ReactNode}){
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow w-full max-w-lg p-5 space-y-3" onClick={e=>e.stopPropagation()}>
        <div className="text-lg font-semibold">{title}</div>
        <div className="text-sm text-gray-700">{children}</div>
        <div className="flex gap-2 justify-end">{actions}</div>
      </div>
    </div>
  )
}
