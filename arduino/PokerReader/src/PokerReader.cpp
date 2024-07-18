#include <Arduino.h>
#include <SPI.h>
#include <PN532_SPI.h>
#include <PN532.h>
#include <NfcAdapter.h>
#include <Sensor.cpp>

#define NUMBER_READERS 1
#define EXPECTED_NUM_CARDS 2
#define CARD_READ_TIMEOUT 15

#if defined(ESP32)
#define MULTI_THREADED true
TaskHandle_t Task0;
TaskHandle_t Task1;
#else
#define MULTI_THREADED false
#endif

NfcAdapter *nfc[NUMBER_READERS];
String tagIds[NUMBER_READERS];
Sensor *sensors[NUMBER_READERS];

void readNFC(int startingSensor, int endingSensor);
void readNFCTask(void *param);
// void readNFCTask1(void *param);
void connectReader(int index, int pin);

void setup(void)
{
  Serial.begin(115200);
  while (!Serial)
  {
    ;
  }
  Serial.println(NUMBER_READERS);
  for (int i = 0; i < NUMBER_READERS; i++)
  {
    int tryPin = i;
    while (!(*nfc[i]).begin())
    {
      connectReader(i, tryPin);
      tryPin++;
      if (tryPin > 3)
      {
        tryPin = i;
      }
    }
  }
  if (MULTI_THREADED)
  {
    int startEndParms[2] = {0, 1};
    xTaskCreatePinnedToCore(
        readNFCTask, /* Function to implement the task */
        "Task0",     /* Name of the task */
        10000,       /* Stack size in words */
        NULL,        /* Task input parameter */
        0,           /* Priority of the task */
        &Task0,      /* Task handle. */
        0);          /* Core where the task should run */
    startEndParms[0] = 1;
    startEndParms[1] = NUMBER_READERS;
    xTaskCreatePinnedToCore(
        readNFCTask, /* Function to implement the task */
        "Task1",     /* Name of the task */
        10000,       /* Stack size in words */
        NULL,        /* Task input parameter */
        0,           /* Priority of the task */
        &Task1,      /* Task handle. */
        1);          /* Core where the task should run */
  }
}

void connectReader(int index, int pin)
{
  PN532_SPI interface(SPI, pin);
  nfc[index] = new NfcAdapter(interface);
  if (sensors[index] == NULL)
  {
    sensors[index] = new Sensor(EXPECTED_NUM_CARDS, CARD_READ_TIMEOUT);
  }
  tagIds[index] = "";
}

void loop()
{
  Serial.print("Core: ");
  Serial.println(xPortGetCoreID());
  if (Serial.available() > 0)
  {
    String incomingString = Serial.readString();
    incomingString.trim();
    if (incomingString == "resync")
    {
      Serial.println(NUMBER_READERS);
      for (int i = 0; i < NUMBER_READERS; i++)
      {
        Serial.println(String(i) + ":" + tagIds[i]);
      }
    }
    else
    {
      Serial.println(incomingString);
    }
  }
  if (!MULTI_THREADED)
  {
    readNFC(0, NUMBER_READERS);
  }
}

void readNFC(int startingSensor, int endingSensor)
{
  for (int i = startingSensor; i < endingSensor; i++)
  {
    NfcAdapter target = *nfc[i];
    Sensor sensor = *sensors[i];
    if (target.tagPresent(50))
    {
      NfcTag tag = target.read();
      String newTag = tag.getUidString();
      if (sensor.readCard(newTag))
      {
        Serial.println(String(i) + ":" + sensor.getComm());
      }
    }
    else if (sensor.cardPresent())
    {
      if (sensor.readCard(""))
      {
        Serial.println(String(i) + ":" + sensor.getComm());
      }
    }
  }
}
void readNFCTask(void *param)
{
  for (;;)
  {
    Serial.print("Read Core 1: ");
    uint32_t core = xPortGetCoreID();
    Serial.println(core);
    if (core == 0)
    {
      readNFC(0, 1);
    }
    else
    {
      readNFC(1, NUMBER_READERS);
    }
  }
}
// void readNFCTask1(void *param)
// {
//   for (;;)
//   {
//     Serial.print("Read Core 2: ");
//     Serial.println(xPortGetCoreID());
//     readNFC(1, NUMBER_READERS);
//   }
// }