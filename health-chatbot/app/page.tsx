"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";


export default function Home() {
  // 🔹 Tab management
  const [activeTab, setActiveTab] = useState<"chat" | "symptoms" | "diseases" | "emergency" | "prescription">("chat");
  const [language, setLanguage] = useState("en");

  // 🔹 Chatbot state
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "👋 Hi there! I’m your AI Health Assistant. I’m here to share useful health information and general advice to help you stay well. Tell me how are you feeling?",
    },
  ]);


  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    const userMessage = input;
    setInput("");

    try {
      console.log("LANG: ", language);
      // 🔹 Call your Next.js API route
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, lang: language }),
      });

      if (!res.ok) throw new Error("Failed to get response");

      const data = await res.json();
      const botReply = data.reply ?? "Sorry, I didn’t get that.";

      setMessages([...newMessages, { role: "assistant", content: botReply }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content:
            "⚠️ Sorry, I had trouble connecting to the health assistant service. Please try again shortly.",
        },
      ]);
    }
  };




  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🔹 Symptom Checker state
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const symptomsList = [
    "Fever",
    "Cough",
    "Headache",
    "Fatigue",
    "Sore Throat",
    "Runny Nose",
    "Body Aches",
    "Shortness of Breath",
    "Loss of Taste/Smell",
    "Nausea",
    "Vomiting",
    "Diarrhea",
    "Chest Pain",
    "Dizziness",
  ];

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };

  // const analyzeSymptoms = () => {
  //   if (selectedSymptoms.length === 0) {
  //     setAnalysis("Please select at least one symptom to analyze.");
  //     return;
  //   }

  //   // Symptom-to-analysis mapping
  //   const symptomResponses: Record<string, string> = {
  //     Fever:
  //       "Fever often indicates your body is fighting an infection. Stay hydrated and monitor your temperature.",
  //     Cough:
  //       "A cough can be caused by a viral infection, allergies, or irritation. Persistent coughs may need medical evaluation.",
  //     Headache:
  //       "Headaches can result from dehydration, stress, or viral illness. Rest and hydration usually help.",
  //     Fatigue:
  //       "Fatigue may be due to lack of sleep, infection, or nutritional deficiency. Ensure proper rest and balanced diet.",
  //     "Sore Throat":
  //       "A sore throat often points to irritation or infection. Warm fluids and rest can ease discomfort.",
  //     "Runny Nose":
  //       "A runny nose is common in colds or allergies. Use saline sprays and stay hydrated.",
  //     "Body Aches":
  //       "Body aches typically occur with viral infections or overexertion. Rest helps recovery.",
  //     "Shortness of Breath":
  //       "Shortness of breath should be taken seriously — if severe or persistent, seek medical attention immediately.",
  //     "Loss of Taste/Smell":
  //       "Loss of taste or smell may occur in viral infections such as COVID-19. Consider testing if accompanied by other symptoms.",
  //     Nausea:
  //       "Nausea may be due to gastrointestinal upset, infection, or dehydration. Avoid heavy meals and stay hydrated.",
  //     Vomiting:
  //       "Vomiting can lead to dehydration. Take small sips of fluids and seek care if it persists.",
  //     Diarrhea:
  //       "Diarrhea may result from infection or food intolerance. Replenish fluids and electrolytes.",
  //     "Chest Pain":
  //       "Chest pain can be serious — if it’s sharp, persistent, or accompanied by shortness of breath, seek emergency care immediately.",
  //     Dizziness:
  //       "Dizziness can stem from dehydration, low blood pressure, or inner ear issues. Rest and hydration are important.",
  //   };

  //   // Collect responses for selected symptoms
  //   const selectedResponses = selectedSymptoms.map(
  //     (symptom) => symptomResponses[symptom] || `No data available for ${symptom}.`
  //   );

  //   // Join into a full analysis
  //   const combinedAnalysis = `🩺 Based on your selected symptoms:\n\n${selectedResponses
  //     .map((r, i) => `${i + 1}. ${r}`)
  //     .join("\n\n")}\n\n💡 This is general information only. Please consult a healthcare professional if symptoms persist or worsen.`;

  //   setAnalysis(combinedAnalysis);
  // };

  const analyzeSymptoms = async () => {
    if (selectedSymptoms.length === 0) {
      setAnalysis("Please select at least one symptom to analyze.");
      return;
    }

    setAnalysis("🔍 Analyzing your symptoms... Please wait a moment.");

    try {
      const symptomText = selectedSymptoms.join(", ");

      // 🔹 Ask OpenAI for an analysis
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Analyze these symptoms: ${symptomText}. Provide possible common causes and general health guidance. Be concise and factual.`,
          lang: language,
        }),
      });

      if (!res.ok) throw new Error("Failed to fetch AI analysis");

      const data = await res.json();

      setAnalysis(
        `🩺 **AI Health Analysis**\n\n${data.reply}\n\n💡 *This is general information only. Please consult a healthcare professional for an accurate diagnosis.*`
      );
    } catch (error) {
      console.error("Symptom analysis error:", error);
      setAnalysis(
        "⚠️ Sorry, I couldn't analyze the symptoms right now. Please try again in a moment."
      );
    }
  };

  const [selectedDisease, setSelectedDisease] = useState<string | null>(null);

  const diseases = [
    {
      name: "COVID-19",
      info: `COVID-19 is caused by the SARS-CoV-2 virus. It primarily spreads through respiratory droplets when an infected person coughs, sneezes, or talks. 
Symptoms include fever, dry cough, fatigue, and loss of taste or smell. 
Severe cases can lead to pneumonia or acute respiratory distress. 
🩺 **Prevention:** Wear masks, maintain social distance, wash hands regularly, and get vaccinated. 
💊 **Treatment:** Symptomatic care, hydration, rest, and antiviral medications as prescribed.`,
    },
    {
      name: "Influenza (Flu)",
      info: `Influenza is a contagious respiratory illness caused by influenza viruses that infect the nose, throat, and sometimes lungs. 
Symptoms include fever, chills, sore throat, muscle aches, and fatigue. 
🩺 **Prevention:** Annual flu vaccination, good hygiene, and avoiding contact with sick individuals. 
💊 **Treatment:** Antiviral drugs may shorten illness if started early; rest and fluids are recommended.`,
    },
    {
      name: "Dengue",
      info: `Dengue is a mosquito-borne viral infection transmitted by the Aedes aegypti mosquito. 
It causes high fever, severe headache, pain behind the eyes, muscle and joint pain, and rash. 
🩺 **Prevention:** Avoid mosquito bites, use repellents, and eliminate standing water. 
💊 **Treatment:** No specific antiviral treatment — manage with fluids, paracetamol, and medical supervision. Avoid aspirin or ibuprofen.`,
    },
    {
      name: "Malaria",
      info: `Malaria is a life-threatening disease caused by Plasmodium parasites, transmitted through bites of infected Anopheles mosquitoes. 
Symptoms include fever, chills, headache, and vomiting, often occurring in cycles. 
🩺 **Prevention:** Use mosquito nets, repellents, and take prophylactic antimalarial drugs in endemic regions. 
💊 **Treatment:** Antimalarial medications like chloroquine or artemisinin-based therapies under medical guidance.`,
    },
    {
      name: "Tuberculosis (TB)",
      info: `Tuberculosis is a bacterial infection caused by *Mycobacterium tuberculosis*, primarily affecting the lungs. 
It spreads through airborne droplets when an infected person coughs or sneezes. 
Symptoms include persistent cough (often with blood), chest pain, fever, and weight loss. 
🩺 **Prevention:** BCG vaccination and early detection. 
💊 **Treatment:** Long-term antibiotic regimen (6 months or more) with drugs like isoniazid, rifampicin, ethambutol, and pyrazinamide.`,
    },
    {
      name: "Typhoid Fever",
      info: `Typhoid Fever is caused by *Salmonella Typhi* bacteria, spread through contaminated food or water. 
Symptoms include prolonged high fever, abdominal pain, headache, and weakness. 
🩺 **Prevention:** Drink safe water, eat hygienically prepared food, and wash hands often. 
💊 **Treatment:** Antibiotic therapy, hydration, and rest are essential. Vaccination provides partial protection.`,
    },
    {
      name: "Cholera",
      info: `Cholera is an acute diarrheal illness caused by *Vibrio cholerae* bacteria, often due to contaminated water or food. 
It leads to rapid fluid loss and dehydration. 
🩺 **Prevention:** Drink boiled or bottled water, maintain good sanitation, and avoid raw food. 
💊 **Treatment:** Immediate rehydration with ORS and IV fluids; antibiotics may be used in severe cases.`,
    },
    {
      name: "Hepatitis B",
      info: `Hepatitis B is a viral infection that attacks the liver, transmitted via blood, sexual contact, or from mother to child. 
Symptoms include jaundice, fatigue, and abdominal pain. 
🩺 **Prevention:** Vaccination, safe sex practices, and avoiding sharing needles. 
💊 **Treatment:** Antiviral medications can control chronic infection; supportive care for acute cases.`,
    },
    {
      name: "Hepatitis C",
      info: `Hepatitis C is a liver infection caused by the HCV virus, spread through blood contact (e.g., unsafe injections). 
Chronic infection can lead to cirrhosis or liver cancer. 
🩺 **Prevention:** Avoid sharing needles or razors; screen blood transfusions. 
💊 **Treatment:** Direct-acting antivirals (DAAs) can cure most cases.`,
    },
    {
      name: "Zika Virus",
      info: `Zika is transmitted primarily by Aedes mosquitoes. 
Most people have mild symptoms — fever, rash, and joint pain — but infection during pregnancy can cause birth defects. 
🩺 **Prevention:** Avoid mosquito bites and practice safe sex if traveling from affected areas. 
💊 **Treatment:** No specific treatment; rest and hydration help manage symptoms.`,
    },
    {
      name: "Chickenpox (Varicella)",
      info: `Chickenpox is a contagious disease caused by the varicella-zoster virus. 
It causes an itchy rash with small blisters, fever, and fatigue. 
🩺 **Prevention:** Varicella vaccine provides effective protection. 
💊 **Treatment:** Rest, antihistamines, and fever reducers; avoid scratching to prevent infection.`,
    },
    {
      name: "Leptospirosis",
      info: `Leptospirosis is a bacterial infection transmitted through water contaminated with animal urine. 
It causes high fever, chills, muscle aches, and jaundice. 
🩺 **Prevention:** Avoid wading in floodwaters or contaminated water. 
💊 **Treatment:** Antibiotics such as doxycycline or penicillin under medical supervision.`,
    },
    {
      name: "Swine Flu (H1N1)",
      info: `Swine Flu is an influenza virus infection similar to seasonal flu but can cause severe illness. 
Symptoms include fever, sore throat, cough, and body aches. 
🩺 **Prevention:** Annual flu vaccine, mask usage, and hygiene practices. 
💊 **Treatment:** Antiviral drugs like oseltamivir under medical advice.`,
    },
  ];


  // 🔹 Prescription Reader state
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [prescriptionResult, setPrescriptionResult] = useState<string | null>(null);
  const [isLoadingPrescription, setIsLoadingPrescription] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setPrescriptionResult(null);
    }
  };


  const analyzePrescription = async () => {
    if (!image) {
      setPrescriptionResult("⚠️ Please upload a prescription image first.");
      return;
    }

    setIsLoadingPrescription(true);
    setPrescriptionResult("🔍 Analyzing your prescription...");

    try {
      const formData = new FormData();
      formData.append("file", image);
      formData.append("lang", language);

      const res = await fetch("/api/prescription", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to process prescription");

      const data = await res.json();
      setPrescriptionResult(`📋 **Prescription Summary**\n\n${data.reply}`);
    } catch (error) {
      console.error("Prescription error:", error);
      setPrescriptionResult("❌ Sorry, I couldn’t read the prescription. Please try again.");
    } finally {
      setIsLoadingPrescription(false);
    }
  };


  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      {/* 🔹 Header Navigation */}
      <header className="flex justify-center border-b border-gray-200 backdrop-blur-md bg-white/70 sticky top-0 z-50 shadow-md">
        <nav className="flex space-x-4 py-3">
          {[
            { key: "chat", label: "💬 Chat" },
            { key: "symptoms", label: "🩺 Symptom Checker" },
            { key: "diseases", label: "🧬 Diseases" },
            { key: "emergency", label: "🚨 Emergency" },
            { key: "prescription", label: "📸 Read Prescription" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`text-sm font-medium px-4 py-2 rounded-xl transition-all duration-300 ${activeTab === tab.key
                ? "bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 text-white shadow-lg scale-105"
                : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        <div className="flex items-center space-x-2 mx-5">
          <label htmlFor="lang" className="text-sm text-gray-600">
            🌐
          </label>
          <select
            id="lang"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="text-sm bg-white border border-gray-300 rounded-lg px-2 py-1 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            <option value="en">English</option>
            <option value="te">తెలుగు</option>
          </select>
        </div>
      </header>

      {/* 🔹 Chatbot Tab */}
      {activeTab === "chat" && (
        <main className="flex flex-col flex-1 items-center justify-between p-6">
          <div className="flex flex-col w-full max-w-3xl flex-1 overflow-y-auto space-y-4 p-6 bg-white/90 rounded-3xl shadow-xl backdrop-blur-sm border border-gray-100">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "assistant" ? "justify-start" : "justify-end"
                  }`}
              >
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm transition-all duration-300 max-w-[80%] ${msg.role === "assistant"
                    ? "bg-gradient-to-r from-blue-100 to-blue-50 text-gray-900"
                    : "bg-gradient-to-r from-green-100 to-emerald-50 text-gray-900"
                    }`}
                >
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="flex w-full max-w-3xl items-center gap-3 mt-4">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about symptoms, prevention, or healthy living..."
              className="flex-1 border border-gray-300 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-gray-800 shadow-sm"
            />
            <button
              onClick={sendMessage}
              className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 text-white px-6 py-3 rounded-full hover:opacity-90 transition font-medium shadow-md"
            >
              Send
            </button>
          </div>
        </main>
      )}

      {/* 🔹 Symptom Checker Tab */}
      {activeTab === "symptoms" && (
        <main className="flex flex-col flex-1 items-center p-6">
          <div className="w-full max-w-3xl bg-white/95 rounded-3xl shadow-xl border border-gray-100 p-6 backdrop-blur-sm">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <span>🩺</span> Symptom Checker
            </h2>
            <p className="text-gray-600 mt-1 mb-4">
              Select your symptoms for AI-powered analysis.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {symptomsList.map((symptom) => (
                <button
                  key={symptom}
                  onClick={() => toggleSymptom(symptom)}
                  className={`border rounded-lg px-4 py-2 text-sm text-left transition ${selectedSymptoms.includes(symptom)
                    ? "bg-gradient-to-r from-blue-200 to-blue-100 border-blue-400 text-blue-700 shadow-sm"
                    : "bg-gray-50 border-gray-300 text-gray-800 hover:bg-blue-50"
                    }`}
                >
                  {symptom}
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={analyzeSymptoms}
                className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 text-white px-6 py-3 rounded-full hover:opacity-90 transition shadow-md"
              >
                Analyze Symptoms
              </button>
              <button
                onClick={() => {
                  setSelectedSymptoms([]);
                  setAnalysis(null);
                }}
                className="text-gray-500 hover:text-red-500"
              >
                Cancel
              </button>
            </div>

            {analysis && (
              <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 text-gray-800 text-sm border border-blue-100">
                <ReactMarkdown>{analysis}</ReactMarkdown>
              </div>
            )}

            <p className="text-xs text-gray-500 mt-4 text-center">
              This tool provides general information only. Seek immediate
              medical attention for severe symptoms.
            </p>
          </div>
        </main>
      )}


      {/* 🔹 Prescription Reader Tab */}
      {activeTab === "prescription" && (
        <main className="flex flex-col flex-1 items-center p-6">
          <div className="w-full max-w-3xl bg-white/95 rounded-3xl shadow-xl border border-gray-100 p-6 backdrop-blur-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span>📸</span> Prescription Reader
            </h2>
            <p className="text-gray-600 text-sm mb-4">
              Upload an image of your prescription, and the AI will extract and summarize the details.
            </p>

            <div className="flex flex-col items-center border-2 border-dashed border-gray-300 rounded-2xl p-6 bg-gray-50">
              {!preview ? (
                <>
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer text-blue-600 font-medium hover:underline"
                  >
                    Click to upload prescription
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </>
              ) : (
                <>
                  <img
                    src={preview}
                    alt="Prescription preview"
                    className="rounded-xl shadow-md mb-4 max-h-64 object-contain"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={analyzePrescription}
                      disabled={isLoadingPrescription}
                      className={`bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 text-white px-6 py-3 rounded-full shadow-md hover:opacity-90 transition ${isLoadingPrescription ? "opacity-70 cursor-wait" : ""
                        }`}
                    >
                      {isLoadingPrescription ? "Analyzing..." : "Analyze Prescription"}
                    </button>
                    <button
                      onClick={() => {
                        setImage(null);
                        setPreview(null);
                        setPrescriptionResult(null);
                      }}
                      className="text-gray-500 hover:text-red-500"
                    >
                      Clear
                    </button>
                  </div>
                </>
              )}
            </div>

            {prescriptionResult && (
              <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 text-gray-800 text-sm border border-blue-100">
                <ReactMarkdown>{prescriptionResult}</ReactMarkdown>
              </div>
            )}

            <p className="text-xs text-gray-500 mt-4 text-center">
              ⚠️ This tool provides general information only. Always confirm with a licensed pharmacist or doctor.
            </p>
          </div>
        </main>
      )}


      {/* 🔹 Diseases Tab */}
      {activeTab === "diseases" && (
        <main className="flex flex-col flex-1 items-center p-6">
          <div className="w-full max-w-3xl bg-white/95 rounded-3xl shadow-xl border border-gray-100 p-6 backdrop-blur-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              AI-Driven Public Health Chatbot for Disease Awareness
            </h2>
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              A major challenge in public health is the widespread lack of access to accurate,
              up-to-date, and personalized health information. This project aims to build an AI
              system that delivers trusted, tailored health insights.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {diseases.map((disease) => (
                <button
                  key={disease.name}
                  onClick={() => setSelectedDisease(disease.name)}
                  className="border border-gray-300 rounded-xl p-4 text-sm font-medium text-left bg-gradient-to-br from-blue-50 to-pink-50 hover:from-blue-100 hover:to-pink-100 transition text-gray-900 shadow-sm"
                >
                  {disease.name}
                </button>
              ))}
            </div>

            {selectedDisease && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white p-6 rounded-2xl max-w-md w-full shadow-2xl">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {selectedDisease}
                  </h3>
                  <p className="text-gray-700 text-sm">
                    {diseases.find((d) => d.name === selectedDisease)?.info}
                  </p>
                  <button
                    onClick={() => setSelectedDisease(null)}
                    className="mt-4 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 text-white px-4 py-2 rounded-full hover:opacity-90 transition shadow-md"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      )}

      {/* 🔹 Emergency Tab */}
      {activeTab === "emergency" && (
        <main className="flex flex-col flex-1 items-center p-6">
          <div className="w-full max-w-3xl bg-white/95 rounded-3xl shadow-xl border border-gray-100 p-6 backdrop-blur-sm">
            <h2 className="text-xl font-semibold text-red-600 mb-2">
              🚨 Emergency Assistance
            </h2>
            <p className="text-gray-700 mb-4 text-sm">
              If you or someone nearby is experiencing any of the following symptoms, seek emergency medical help immediately.
            </p>

            <ul className="list-disc list-inside text-sm text-gray-800 space-y-2 mb-6">
              <li>Severe chest pain or pressure</li>
              <li>Difficulty breathing or shortness of breath</li>
              <li>Loss of consciousness or unresponsiveness</li>
              <li>Severe bleeding that won’t stop</li>
              <li>Sudden confusion, trouble speaking, or facial drooping</li>
              <li>Seizures or convulsions</li>
              <li>Severe allergic reaction (swelling of face or throat)</li>
              <li>Severe burns or trauma</li>
            </ul>

            <div className="bg-gradient-to-r from-red-100 to-pink-100 text-red-800 p-4 rounded-xl text-center border border-red-200 shadow-sm">
              🚑 <span className="font-semibold">Call Emergency Services Now:</span>
              <div className="text-2xl font-bold mt-2">112</div>
              <p className="text-sm mt-1">Or your local emergency number</p>
            </div>

            <p className="text-xs text-gray-500 mt-6 text-center">
              Stay calm, ensure safety, and follow operator instructions until help arrives.
            </p>
          </div>
        </main>
      )}
      <footer className="text-center py-4 text-sm text-gray-600 mt-auto">
        <a
          href="https://drive.google.com/drive/folders/1nCfR1csf4keGKExVKm73CdFjMTt1RN9-?usp=sharing"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          💻 View Code on GitHub
        </a>
      </footer>
    </div>
  );


}
