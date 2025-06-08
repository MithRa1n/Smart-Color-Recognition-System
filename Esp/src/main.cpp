#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Adafruit_TCS34725.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET    -1

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);
Adafruit_TCS34725 tcs = Adafruit_TCS34725(TCS34725_INTEGRATIONTIME_600MS, TCS34725_GAIN_1X);


const char* ssid = "*";
const char* password = "*";
const char* serverUrl = "*";

void connectWiFi() {
  WiFi.begin(ssid, password);
  display.clearDisplay();
  display.setCursor(0, 0);
  display.println("Підключення WiFi...");
  display.display();

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  display.clearDisplay();
  if (WiFi.status() == WL_CONNECTED) {
    display.setCursor(0, 0);
    display.println("WiFi OK");
    display.println(WiFi.localIP());
  } else {
    display.setCursor(0, 0);
    display.println("WiFi ❌");
  }
  display.display();
  delay(1000);
}

void setup() {
  Serial.begin(115200);
  Wire.begin(D6, D5);

  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("❌ OLED не знайдено");
    while (true);
  }
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);

  if (!tcs.begin()) {
    display.println("❌ TCS не знайдено");
    display.display();
    while (true);
  }

  connectWiFi();
}

unsigned long lastSent = 0;
const unsigned long interval = 5000;

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  unsigned long currentMillis = millis();
  if (currentMillis - lastSent >= interval) {
    lastSent = currentMillis;

    uint16_t r, g, b, c;
    tcs.getRawData(&r, &g, &b, &c);

    display.clearDisplay();
    display.setCursor(0, 0);
    display.printf("R:%d G:%d B:%d", r, g, b);
    display.display();

    WiFiClient client;
    HTTPClient http;

    if (http.begin(client, serverUrl)) {
      http.addHeader("Content-Type", "application/json");

      StaticJsonDocument<200> json;
      json["red"] = r;
      json["green"] = g;
      json["blue"] = b;

      String requestBody;
      serializeJson(json, requestBody);

      int statusCode = http.POST(requestBody);
      Serial.printf("POST status: %d\n", statusCode);
      http.end();
    }
  }
}
