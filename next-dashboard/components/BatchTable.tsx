export default function BatchTable({batches, onSelect}:{batches:any[], onSelect:(id:string)=>void}){
  return (
    <div className="bg-white rounded-xl shadow">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="p-3">Batch ID</th>
            <th className="p-3">Site</th>
            <th className="p-3">H₂ (kg)</th>
            <th className="p-3">kWh</th>
            <th className="p-3">Water (L)</th>
            <th className="p-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {batches.map((b:any)=> (
            <tr key={b.batch_id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={()=>onSelect(b.batch_id)}>
              <td className="p-3 font-mono">{b.batch_id}</td>
              <td className="p-3">{b.site_id}</td>
              <td className="p-3">{b.h2_mass_kg}</td>
              <td className="p-3">{b.elec_kWh}</td>
              <td className="p-3">{b.water_L}</td>
              <td className="p-3">{b.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
