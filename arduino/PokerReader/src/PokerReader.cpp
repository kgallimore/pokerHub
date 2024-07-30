#include <Arduino.h>
#include <SPI.h>
#include <PN532_SPI.h>
#include <PN532.h>
#include <NfcAdapter.h>
#include <Sensor.cpp>

#define NUMBER_READERS 1
#define EXPECTED_NUM_CARDS 2
#define CARD_READ_TIMEOUT 15

NfcAdapter *nfc[NUMBER_READERS];
String tagIds[NUMBER_READERS];
Sensor *sensors[NUMBER_READERS];

void readNFC(int startingSensor, int endingSensor);
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
  readNFC(0, NUMBER_READERS);
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