'use client'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function MetricChart({title, data}:{title:string, data:{t:Date, v:number}[]}){
  const rows = data.map(d=>({ x: new Date(d.t).toLocaleTimeString(), y: d.v }))
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="text-sm text-gray-500 mb-2">{title}</div>
      <div style={{height:220}}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows}>
            <XAxis dataKey="x" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="y" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
