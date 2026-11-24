const GROUPS = {
  Animal: ["Animal", "Domestic animals, pets", "Dog", "Bark", "Cat", "Bird", "Bird vocalization", "Insect", "Livestock", "Horse", "Wild animals"],
  Human: ["Speech", "Conversation", "Laughter", "Crying", "Cough", "Sneeze", "Clapping", "Footsteps"],
  Transport: ["Vehicle", "Car", "Truck", "Bus", "Motorcycle", "Train", "Aircraft", "Engine", "Vehicle horn"],
  Industrial: ["Engine", "Machinery", "Tools", "Power tool", "Drill", "Pump", "Mechanical fan", "Air conditioning"],
  Nature: ["Rain", "Thunder", "Wind", "Water", "Ocean", "Stream", "Fire", "Crackling"],
  Household: ["Door", "Knock", "Doorbell", "Appliance", "Vacuum cleaner", "Blender", "Clock", "Alarm clock"],
  Music: ["Music", "Musical instrument", "Guitar", "Piano", "Drum", "Singing"],
  Alerts: ["Siren", "Alarm", "Smoke detector", "Bell", "Buzzer"]
};
export function categoryFor(label = "") {
  const normalized = label.toLowerCase();
  for (const [category, labels] of Object.entries(GROUPS)) {
    if (labels.some(item => normalized.includes(item.toLowerCase()) || item.toLowerCase().includes(normalized))) return category;
  }
  return "Other / Unknown";
}
