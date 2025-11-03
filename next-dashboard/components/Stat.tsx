export default function Stat({label, value}:{label:string, value:string}){
  return (
    <div className="rounded-xl bg-white shadow p-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  )
}
