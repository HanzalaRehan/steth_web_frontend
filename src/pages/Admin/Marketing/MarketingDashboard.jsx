import { useState, useEffect, useRef } from "react"
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import Player from "rrweb-player"
import "rrweb-player/dist/style.css"
import { API_BASE_URL } from "../../../config/api"

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("accessToken")}` })

const MarketingDashboard = () => {
  const [kpis, setKpis] = useState(null)
  const [funnel, setFunnel] = useState([])
  const [topPages, setTopPages] = useState(null)
  const [topSearches, setTopSearches] = useState([])
  const [replaySessions, setReplaySessions] = useState([])
  const [selectedSessionId, setSelectedSessionId] = useState(null)
  const [loading, setLoading] = useState(true)
  const playerContainerRef = useRef(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [kpisRes, funnelRes, pagesRes, searchesRes, sessionsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/analytics/kpis`, { headers: authHeader() }),
          fetch(`${API_BASE_URL}/api/analytics/funnel`, { headers: authHeader() }),
          fetch(`${API_BASE_URL}/api/analytics/top-pages`, { headers: authHeader() }),
          fetch(`${API_BASE_URL}/api/analytics/top-searches`, { headers: authHeader() }),
          fetch(`${API_BASE_URL}/api/analytics/replay-sessions`, { headers: authHeader() }),
        ])

        const [kpisData, funnelData, pagesData, searchesData, sessionsData] = await Promise.all([
          kpisRes.json(), funnelRes.json(), pagesRes.json(), searchesRes.json(), sessionsRes.json(),
        ])

        if (kpisData.success) setKpis(kpisData)
        if (funnelData.success) setFunnel(funnelData.funnel)
        if (pagesData.success) setTopPages(pagesData)
        if (searchesData.success) setTopSearches(searchesData.topSearches)
        if (sessionsData.success) setReplaySessions(sessionsData.sessions)
      } catch (error) {
        toast.error("Failed to load marketing analytics")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Loads and renders a session's rrweb events via rrweb-player. Statically
  // imported (unlike the storefront's own `rrweb` recorder, which is
  // dynamically imported per B.5's lazy-load note) - this admin screen
  // isn't part of the customer-facing bundle at all, so there's no
  // storefront cost either way.
  useEffect(() => {
    if (!selectedSessionId || !playerContainerRef.current) return

    let destroyed = false
    let playerInstance = null

    const loadReplay = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/analytics/sessions/${selectedSessionId}/replay`,
          { headers: authHeader() }
        )
        const data = await response.json()
        if (!data.success || destroyed) return

        if (!data.events || data.events.length < 2) {
          toast.error("Not enough replay data captured for this session yet")
          return
        }

        playerContainerRef.current.innerHTML = ""
        playerInstance = new Player({
          target: playerContainerRef.current,
          props: { events: data.events, width: 900, height: 500 },
        })
      } catch (error) {
        toast.error("Failed to load session replay")
      }
    }

    loadReplay()
    return () => {
      destroyed = true
      if (playerInstance?.$destroy) playerInstance.$destroy()
    }
  }, [selectedSessionId])

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading analytics...</div>
  }

  const firstStageCount = funnel[0]?.sessions || 0

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Marketing Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Total Sessions (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{kpis?.totalSessions ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Identified Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{kpis?.identifiedSessions ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Recorded Replays</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{replaySessions.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sessions Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ width: "100%", height: 250 }}>
            <ResponsiveContainer>
              <LineChart data={kpis?.sessionsOverTime || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Funnel &amp; Drop-off</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ width: "100%", height: 250 }}>
            <ResponsiveContainer>
              <BarChart data={funnel}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="sessions" fill="#16a34a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <Table className="mt-4">
            <TableHeader>
              <TableRow>
                <TableHead>Stage</TableHead>
                <TableHead>Sessions</TableHead>
                <TableHead>Drop-off vs. Landed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {funnel.map((stage) => (
                <TableRow key={stage.key}>
                  <TableCell>{stage.label}</TableCell>
                  <TableCell>{stage.sessions}</TableCell>
                  <TableCell>
                    {firstStageCount > 0
                      ? `${(100 - (stage.sessions / firstStageCount) * 100).toFixed(1)}%`
                      : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Top Entry Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow><TableHead>Page</TableHead><TableHead>Sessions</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {(topPages?.topEntryPages || []).map((p) => (
                  <TableRow key={p.page}><TableCell>{p.page}</TableCell><TableCell>{p.count}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Exit Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow><TableHead>Page</TableHead><TableHead>Sessions</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {(topPages?.topExitPages || []).map((p) => (
                  <TableRow key={p.page}><TableCell>{p.page}</TableCell><TableCell>{p.count}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Search Terms</CardTitle>
        </CardHeader>
        <CardContent>
          {topSearches.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow><TableHead>Term</TableHead><TableHead>Searches</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {topSearches.map((s) => (
                  <TableRow key={s.term}><TableCell>{s.term}</TableCell><TableCell>{s.count}</TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">No search terms recorded yet.</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session Replay</CardTitle>
        </CardHeader>
        <CardContent>
          {replaySessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                {replaySessions.map((s) => (
                  <Button
                    key={s.sessionId}
                    variant={selectedSessionId === s.sessionId ? "default" : "outline"}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => setSelectedSessionId(s.sessionId)}
                  >
                    {s.sessionId.slice(0, 8)}... ({s.chunks} chunks)
                  </Button>
                ))}
              </div>
              <div className="md:col-span-2 overflow-auto">
                {selectedSessionId ? (
                  <div ref={playerContainerRef} />
                ) : (
                  <div className="text-center py-8 text-gray-500">Select a session to play it back.</div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No recorded sessions yet.</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default MarketingDashboard
