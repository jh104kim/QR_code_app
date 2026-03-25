"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const LOGO_SRC = "/field-dream-logo.svg";
const LOGO_SCALE = 0.24;
const LOGO_PADDING_SCALE = 0.04;
const LOGO_RADIUS_SCALE = 0.03;

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    image.src = src;
  });
}

function drawRoundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const safeRadius = Math.min(radius, width / 2, height / 2);

  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.arcTo(x + width, y, x + width, y + height, safeRadius);
  context.arcTo(x + width, y + height, x, y + height, safeRadius);
  context.arcTo(x, y + height, x, y, safeRadius);
  context.arcTo(x, y, x + width, y, safeRadius);
  context.closePath();
}

async function renderQrWithLogo({
  canvas,
  content,
  size,
  fgColor,
  bgColor,
}: {
  canvas: HTMLCanvasElement;
  content: string;
  size: number;
  fgColor: string;
  bgColor: string;
}) {
  await QRCode.toCanvas(canvas, content, {
    width: size,
    color: { dark: fgColor, light: bgColor },
    errorCorrectionLevel: "H",
    margin: 2,
  });

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Canvas context not available");
  }

  try {
    const logo = await loadImage(LOGO_SRC);
    const logoSize = Math.floor(size * LOGO_SCALE);
    const padding = Math.max(10, Math.floor(size * LOGO_PADDING_SCALE));
    const frameSize = logoSize + padding * 2;
    const frameX = (size - frameSize) / 2;
    const frameY = (size - frameSize) / 2;
    const radius = Math.floor(size * LOGO_RADIUS_SCALE);

    context.fillStyle = bgColor;
    drawRoundedRect(context, frameX, frameY, frameSize, frameSize, radius);
    context.fill();

    context.drawImage(
      logo,
      frameX + padding,
      frameY + padding,
      logoSize,
      logoSize,
    );
  } catch (error) {
    console.warn("Logo overlay skipped:", error);
  }

  return canvas.toDataURL("image/png");
}

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

    const canvas = canvasRef.current;

    if (!canvas) {
      toast.error("QR 캔버스를 초기화하지 못했습니다.");
      return;
    }

    setLoading(true);

    try {
      const dataUrl = await renderQrWithLogo({
        canvas,
        content: url,
        size,
        fgColor,
        bgColor,
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
                    <TabsTrigger value="basic" className="flex-1">
                      기본
                    </TabsTrigger>
                    <TabsTrigger value="advanced" className="flex-1">
                      고급
                    </TabsTrigger>
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
                        <span className="text-sm text-muted-foreground">
                          {fgColor}
                        </span>
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
                        <span className="text-sm text-muted-foreground">
                          {bgColor}
                        </span>
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
                <p className="text-xs text-muted-foreground text-center">
                  생성된 QR 코드 중앙에 브랜드 로고가 자동으로 삽입됩니다.
                </p>
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
                      style={{
                        width: Math.min(size, 280),
                        height: Math.min(size, 280),
                      }}
                    />
                    <Button
                      onClick={downloadQR}
                      variant="outline"
                      className="w-full"
                    >
                      PNG 다운로드
                    </Button>
                  </>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <div className="text-6xl mb-4">📱</div>
                    <p className="text-sm">
                      URL 또는 텍스트를 입력하고
                      <br />
                      QR 코드를 생성하세요
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        <canvas ref={canvasRef} className="hidden" width={size} height={size} />
      </main>
    </div>
  );
}
