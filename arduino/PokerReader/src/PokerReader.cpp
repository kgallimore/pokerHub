#include <Arduino.h>
#include <SPI.h>
#include <PN532_SPI.h>
#include <PN532.h>
#include <NfcAdapter.h>

#define NUMBER_READERS 1
#define EXPECTED_NUM_CARDS 2
#define CARD_READ_TIMEOUT 15

PN532_SPI interface(SPI, 44);

NfcAdapter nfc[NUMBER_READERS] = {NfcAdapter(interface)};

void readNFC();
void readNFCTask(void *param);

// TaskHandle_t Task1;

// SemaphoreHandle_t read;
class ReadTags
{
public:
  unsigned long lastRead = 0;
  void reset()
  {
    tagId = "";
    lastRead = 0;
  }
  bool compareTags(String tag)
  {
    if (tag == tagId)
    {
      lastRead = millis();
      return true;
    }
    return false;
  }
  void setTag(String tag)
  {
    lastRead = millis();
    tagId = tag;
  }
  String getTag()
  {
    return tagId;
  }

private:
  String tagId = "";
};

class Sensor
{
public:
  ReadTags tags[2] = {ReadTags(), ReadTags()};
  Sensor(int expectedNumCards)
  {
    _expectedNumCards = expectedNumCards;
  }
  bool cardPresent()
  {
    return tags[0].lastRead != 0 || tags[1].lastRead != 0;
  }
  bool readCard(String tagId)
  {
    if (tagId == "")
    {
      if (!cardPresent())
      {
        return false;
      }
      for (int i = 0; i < _expectedNumCards; i++)
      {
        if ((tags[i].lastRead + CARD_READ_TIMEOUT * 1000) >= millis())
        {
          return false;
        }
      }
      for (int i = 0; i < _expectedNumCards; i++)
      {
        tags[i].reset();
      }
      return true;
    }
    int lowestRead = tags[0].lastRead;
    int lowestReadInt = 0;
    for (int i = 0; i < _expectedNumCards; i++)
    {
      if (tags[i].getTag() == tagId)
      {
        return false;
      }
      if (tags[i].lastRead < lowestRead)
      {
        lowestRead = tags[i].lastRead;
        lowestReadInt = i;
      }
    }

    tags[lowestReadInt].setTag(tagId);

    return true;
  }
  String getComm()
  {
    String buildStr = "[\"";
    for (int i = 0; i < _expectedNumCards; i++)
    {
      if (i != 0)
      {
        buildStr += ",\"";
      }
      buildStr += tags[i].getTag();
      buildStr += "\"";
    }
    buildStr += "]";
    return buildStr;
  }

private:
  int _expectedNumCards = 1;
};

String tagIds[NUMBER_READERS];
Sensor sensors[NUMBER_READERS] = {Sensor(EXPECTED_NUM_CARDS)};

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
    tagIds[i] = "";
    while (!nfc[i].begin())
      ;
  }
  // xTaskCreatePinnedToCore(
  //     readNFCTask, /* Function to implement the task */
  //     "Task1",     /* Name of the task */
  //     10000,       /* Stack size in words */
  //     NULL,        /* Task input parameter */
  //     0,           /* Priority of the task */
  //     &Task1,      /* Task handle. */
  //     0);          /* Core where the task should run */
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
  readNFC();
}

void readNFC()
{
  for (int i = 0; i < NUMBER_READERS; i++)
  {
    if (nfc[i].tagPresent(50))
    {
      NfcTag tag = nfc[i].read();
      String newTag = tag.getUidString();
      if (sensors[i].readCard(newTag))
      {
        Serial.println(String(i) + ":" + sensors[i].getComm());
      }
    }
    else if (sensors[i].cardPresent())
    {
      if (sensors[i].readCard(""))
      {
        Serial.println(String(i) + ":" + sensors[i].getComm());
      }
    }
  }
}
void readNFCTask(void *param)
{
  for (;;)
  {
    Serial.print("Read Core: ");
    Serial.println(xPortGetCoreID());
    for (int i = 0; i < NUMBER_READERS; i++)
    {
      if (nfc[i].tagPresent(50))
      {
        NfcTag tag = nfc[i].read();
        String newTag = tag.getUidString();
        if (sensors[i].readCard(newTag))
        {
          Serial.println(String(i) + ":" + sensors[i].getComm());
        }
      }
      else if (sensors[i].cardPresent())
      {
        if (sensors[i].readCard(""))
        {
          Serial.println(String(i) + ":" + sensors[i].getComm());
        }
      }
    }
  }
}