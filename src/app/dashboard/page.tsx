"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function DashboardPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  async function generateQR() {
    if (!url.trim()) {
      toast.error("URL 또는 텍스트를 입력해 주세요.");
      return;
    }
    setLoading(true);
    try {
      const dataUrl = await QRCode.toDataURL(url, {
        width: size,
        color: { dark: fgColor, light: bgColor },
        errorCorrectionLevel: "H",
      });
      setQrDataUrl(dataUrl);
      toast.success("QR 코드가 생성되었습니다!");
    } catch {
      toast.error("QR 코드 생성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  function downloadQR() {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = "qrcode.png";
    a.click();
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary">QR 코드 생성기</h1>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            로그아웃
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 입력 패널 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>QR 코드 설정</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="qr-input">URL 또는 텍스트</Label>
                  <Input
                    id="qr-input"
                    type="text"
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && generateQR()}
                  />
                </div>

                <Tabs defaultValue="basic">
                  <TabsList className="w-full">
                    <TabsTrigger value="basic" className="flex-1">기본</TabsTrigger>
                    <TabsTrigger value="advanced" className="flex-1">고급</TabsTrigger>
                  </TabsList>
                  <TabsContent value="basic" className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="size">크기: {size}px</Label>
                      <input
                        id="size"
                        type="range"
                        min={128}
                        max={512}
                        step={32}
                        value={size}
                        onChange={(e) => setSize(Number(e.target.value))}
                        className="w-full accent-primary"
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="advanced" className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="fg-color">전경색 (QR 색상)</Label>
                      <div className="flex items-center gap-3">
                        <input
                          id="fg-color"
                          type="color"
                          value={fgColor}
                          onChange={(e) => setFgColor(e.target.value)}
                          className="h-10 w-16 cursor-pointer rounded border"
                        />
                        <span className="text-sm text-muted-foreground">{fgColor}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bg-color">배경색</Label>
                      <div className="flex items-center gap-3">
                        <input
                          id="bg-color"
                          type="color"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="h-10 w-16 cursor-pointer rounded border"
                        />
                        <span className="text-sm text-muted-foreground">{bgColor}</span>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <Button
                  onClick={generateQR}
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "생성 중..." : "QR 코드 생성"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* 미리보기 패널 */}
          <div>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>미리보기</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center gap-4 min-h-[300px]">
                {qrDataUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrDataUrl}
                      alt="생성된 QR 코드"
                      className="rounded-lg shadow-md"
                      style={{ width: Math.min(size, 280), height: Math.min(size, 280) }}
                    />
                    <Button onClick={downloadQR} variant="outline" className="w-full">
                      PNG 다운로드
                    </Button>
                    <canvas ref={canvasRef} className="hidden" />
                  </>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <div className="text-6xl mb-4">📱</div>
                    <p className="text-sm">
                      URL 또는 텍스트를 입력하고<br />QR 코드를 생성하세요
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
