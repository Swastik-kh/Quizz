export interface CaseData {
  description: string;
  questions: string[];
  answers: string[];
}

export const questions: { [key: number]: CaseData } = {
  1: {
    description: "रमेश, उमेर 5 दिन, तौल 2.2 केजी। आमाले बच्चाले राम्रोसँग दूध नचुस्ने बताइन्। बच्चाको सास 68/min छ। बच्चा सुस्त छ र ज्वरो 38°C छ।",
    questions: ["यो बच्चाको Classification के हुन्छ ?", "कुन danger signs छन् ?", "पहिलो dose कुन antibiotic दिने ?", "Management र referral कसरी गर्ने ?"],
    answers: ["Possible serious bacterial infection", "सुस्त, ज्वरो, सास छिटो", "Gentamicin and Ampicillin", "Referral र व्यवस्थापन"]
  },
  2: {
    description: "सृष्टि, उमेर 12 दिन, तौल 2.4 केजी। बच्चाको नाभीबाट पिप बगिरहेको छ। नाभी वरिपरि रातोपन छ तर पेटसम्म फैलिएको छैन। बच्चा सामान्य स्तनपान गरिरहेको छ।",
    questions: ["Classification के हुन्छ ?", "Local bacterial infection हो कि होइन ?", "कुन औषधि दिने ?", "Follow up कहिले गर्ने ?"],
    answers: ["Local bacterial infection", "हो", "Gentian violet", "२ दिनमा"]
  },
  3: {
    description: "आयुष, उमेर 20 दिन, तौल 2.7 केजी। बच्चाको सास 74/min छ। छाती भित्र तानिएको छ। बच्चाले दूध खान मानेको छैन।",
    questions: ["Classification के हुन्छ ?", "Possible serious bacterial infection का संकेत के-के हुन् ?", "तुरुन्त Management के गर्ने ?", "Referral अघि कुन औषधि दिने ?"],
    answers: ["Possible serious bacterial infection", "सास फेर्न कठिनाइ, दूध नपिउने/सुस्त", "तुरुन्त Refer गर्ने", "Gentamicin and Ampicillin"]
  },
  4: {
    description: "प्रिया, उमेर 15 दिन, तौल 2.5 केजी। बच्चाको शरीर पहेंलो छ। पहेंलोपन हातखुट्टासम्म फैलिएको छ। बच्चा सुस्त छ।",
    questions: ["Classification के हुन्छ ?", "Severe jaundice का संकेत के हुन् ?", "तुरुन्त Management के गर्ने ?", "स्तनपान सम्बन्धी के सल्लाह दिने ?"],
    answers: ["Severe jaundice", "हातखुट्टासम्म पहेंलो, सुस्त", "Referral", "बारम्बार स्तनपान गराउने"]
  },
  5: {
    description: "अनिशा, उमेर 25 दिन, तौल 3 केजी। बच्चालाई 4 दिनदेखि झाडापखाला छ। आँखा गाडिएका छन्। छाला तानेपछि धेरै ढिलो फर्किन्छ। बच्चा दूध राम्रोसँग पिउँदैन।",
    questions: ["बच्चामा dehydration को स्तर के हो ?", "Classification के हुन्छ ?", "कुन Treatment Plan लागू हुन्छ ?", "ORS कसरी दिने ?"],
    answers: ["Severe", "Severe dehydration", "Plan C", "IV fluid"]
  },
  6: {
    description: "रोशन, उमेर 10 दिन, तौल 1.9 केजी। बच्चा समयभन्दा अगाडि जन्मिएको हो। बच्चाको शरीर चिसो छ (35°C)। बच्चाले स्तनपान गर्न सक्दैन।",
    questions: ["Classification के हुन्छ ?", "Hypothermia को Management कसरी गर्ने ?", "Kangaroo mother care कसरी गर्ने ?", "Referral आवश्यक छ कि छैन ?"],
    answers: ["Severe Hypothermia", "शरीर तताउने, KMC", "छालादेखि छालाको सम्पर्क", "हो, तुरुन्तै"]
  },
  7: {
    description: "सोनिया, उमेर 18 दिन, तौल 2.6 केजी। बच्चाको छालामा धेरै फोका आएका छन्। केही फोका फुटेका छन्। बच्चा सामान्य स्तनपान गरिरहेको छ।",
    questions: ["Classification के हुन्छ ?", "Bacterial local infection को Management के हो ?", "कुन antibiotic दिने ?", "Follow up कहिले गर्ने ?"],
    answers: ["Bacterial local infection", "Gentian violet", "Gentian violet", "२ दिनमा"]
  },
  8: {
    description: "विवेक, उमेर 1 महिना, तौल 3.1 केजी। बच्चालाई खोकी लागेको छ। सास 64/min छ। छाती तानिएको छैन। बच्चा सामान्य रूपमा दूध खान्छ।",
    questions: ["Fast breathing छ कि छैन ?", "Classification के हुन्छ ?", "कुन औषधि दिने ?", "घरमा के सल्लाह दिने ?"],
    answers: ["हो (६०+)", "Pneumonia", "Amoxicillin", "खोकीको उपचार"]
  },
  9: {
    description: "रिया, उमेर 22 दिन, तौल 2.4 केजी। बच्चा काँपेको देखियो। बच्चाले दूध खान मानेको छैन। सास 70/min छ।",
    questions: ["कुन danger signs छन् ?", "Classification के हुन्छ ?", "तुरुन्त Management के गर्ने ?", "Referral किन आवश्यक छ ?"],
    answers: ["काँप्ने, दूध नपिउने", "Possible serious bacterial infection", "Referral", "गम्भीर अवस्था"]
  },
  10: {
    description: "सागर, उमेर 14 दिन, तौल 2.8 केजी। बच्चाको आँखा रातो छ र पिप आइरहेको छ। आँखा सुन्निएको छ।",
    questions: ["Classification के हुन्छ ?", "Eye infection को Management के हो ?", "आँखा कसरी सफा गर्ने ?", "Follow up कहिले गर्ने ?"],
    answers: ["Eye infection", "Ciprofloxacin/Gentian violet", "चिया चम्मच वा सफा कपडाले", "२ दिनमा"]
  },
  11: {
    description: "कविता, उमेर 6 दिन, तौल 2 केजी। बच्चा सुस्त छ। नाभीको रातोपन पेटको छालासम्म फैलिएको छ। बच्चालाई ज्वरो छ।",
    questions: ["Classification के हुन्छ ?", "PSBI हो कि होइन ?", "तुरुन्त Management के गर्ने ?", "Referral किन गर्ने ?"],
    answers: ["Possible serious bacterial infection (PSBI)", "1. PSBI", "Gentamicin and Ampicillin", "Referral"]
  },
  12: {
    description: "अञ्जली, उमेर 28 दिन, तौल 3 केजी। बच्चालाई झाडापखाला छ तर आँखा सामान्य छन्। छाला तानेपछि तुरुन्त फर्किन्छ। बच्चा राम्रोसँग दूध खान्छ।",
    questions: ["Dehydration छ कि छैन ?", "Classification के हुन्छ ?", "घरमै Management कसरी गर्ने ?", "आमालाई के सल्लाह दिने ?"],
    answers: ["छैन", "No dehydration", "Plan A", "स्तनपान गराउने"]
  },
  13: {
    description: "निरज, उमेर 8 दिन, तौल 2.1 केजी। बच्चाको शरीर चिसो छ। बच्चा कम चल्छ। स्तनपान कमजोर छ।",
    questions: ["Classification के हुन्छ ?", "Low body temperature को Management के हो ?", "Kangaroo mother care किन आवश्यक छ ?", "Referral कहिले गर्ने ?"],
    answers: ["Hypothermia", "शरीर तताउने", "तापक्रम कायम राख्न", "Referral"]
  },
  14: {
    description: "रवि, उमेर 21 दिन, तौल 2.7 केजी। बच्चालाई ज्वरो छैन तर सास 72/min छ। बच्चाले स्तनपान कम गरेको छ।",
    questions: ["Classification के हुन्छ ?", "Pneumonia हो कि Possible serious bacterial infection ?", "कुन antibiotic दिने ?", "Follow up कहिले गर्ने ?"],
    answers: ["Possible serious bacterial infection", "Possible serious bacterial infection", "Gentamicin and Ampicillin", "२ दिनमा"]
  },
  15: {
    description: "माया, उमेर 1 महिना, तौल 3.2 केजी। बच्चाको शरीर पहेंलो छ तर हातखुट्टामा पहेंलोपन छैन। बच्चा सामान्य स्तनपान गरिरहेको छ।",
    questions: ["Classification के हुन्छ ?", "Severe jaundice छ कि छैन ?", "Management के गर्ने ?", "Follow up कहिले गर्ने ?"],
    answers: ["Jaundice", "छैन", "बारम्बार स्तनपान", "२ दिनमा"]
  },
  16: {
    description: "रमिला, उमेर 8 महिना, तौल 6 केजी। बच्चालाई 5 दिनदेखि खोकी लागेको छ। सास 58/min छ। छाती भित्र तानिएको छ। बच्चाले दूध खान गाह्रो मानिरहेको छ।",
    questions: ["Classification के हुन्छ ?", "Severe pneumonia हो कि Pneumonia ?", "तुरुन्त Management के गर्ने ?", "Referral आवश्यक छ कि छैन ?"],
    answers: ["Severe Pneumonia", "Severe pneumonia", "Referral/Oxygen", "हो"]
  },
  17: {
    description: "आकाश, उमेर 1 वर्ष, तौल 7 केजी। बच्चालाई 3 दिनदेखि झाडापखाला छ। आँखा गाडिएका छन्। बच्चा बेचैन छ र पानी लोभिएर पिउँछ।",
    questions: ["Dehydration को स्तर के हो ?", "Classification के हुन्छ ?", "कुन Treatment Plan लागू हुन्छ ?", "Zinc कसरी दिने ?"],
    answers: ["Some dehydration", "Some dehydration", "Plan B", "Zinc झोल"]
  },
  18: {
    description: "सुरज, उमेर 2 वर्ष, तौल 9 केजी। बच्चालाई ज्वरो छ। बच्चा सुस्त छ। हिजो दौरा परेको थियो।",
    questions: ["General danger signs के-के हुन् ?", "Classification के हुन्छ ?", "तुरुन्त Management के गर्ने ?", "Referral किन आवश्यक छ ?"],
    answers: ["दौरा, सुस्त", "Severe disease/Serious infection", "Referral", "गम्भीर खतरा"]
  },
  19: {
    description: "प्रिया, उमेर 3 वर्ष, तौल 11 केजी। बच्चाको कानबाट 16 दिनदेखि पिप बगिरहेको छ।",
    questions: ["Classification के हुन्छ ?", "Chronic ear infection हो कि होइन ?", "Ear care कसरी गर्ने ?", "Follow up कहिले गर्ने ?"],
    answers: ["Chronic ear infection", "हो", "कान सफा गर्ने", "५ दिनमा"]
  },
  20: {
    description: "विकास, उमेर 10 महिना, तौल 5.5 केजी। बच्चा अत्यन्त दुब्लो छ। दुवै खुट्टा सुन्निएका छन्।",
    questions: ["Classification के हुन्छ ?", "Severe acute malnutrition का संकेत के हुन् ?", "तुरुन्त Management के गर्ने ?", "Referral आवश्यक छ कि छैन ?"],
    answers: ["Severe Malnutrition", "दुब्लो, खुट्टा सुन्निएका", "Referral", "हो"]
  },
  21: {
    description: "सविना, उमेर 18 महिना, तौल 8 केजी। बच्चालाई ज्वरो, आँखा रातो र शरीरभरि दाना आएको छ। मुखभित्र घाउ पनि देखिन्छ।",
    questions: ["Measles with complication हो कि होइन ?", "Classification के हुन्छ ?", "Vitamin A dose कति दिने ?", "Management के गर्ने ?"],
    answers: ["हो", "Measles with complication", "उमेरअनुसार", "Vitamin A र फलोअप"]
  },
  22: {
    description: "निशा, उमेर 2 वर्ष, तौल 10 केजी। बच्चालाई खोकी छ। सास 32/min छ। छाती तानिएको छैन। बच्चा खेलिरहेको छ।",
    questions: ["Fast breathing छ कि छैन ?", "Classification के हुन्छ ?", "Antibiotic आवश्यक छ कि छैन ?", "घरमा के सल्लाह दिने ?"],
    answers: ["छैन", "No pneumonia, cough or cold", "छैन", "खोकीको उपचार"]
  },
  23: {
    description: "करण, उमेर 14 महिना, तौल 7 केजी। बच्चालाई 15 दिनदेखि झाडापखाला छ। बच्चा दुब्लाएको छ।",
    questions: ["Persistent diarrhea हो कि होइन ?", "Classification के हुन्छ ?", "Zinc कति दिन दिने ?", "Nutrition counseling किन आवश्यक छ ?"],
    answers: ["हो", "Persistent Diarrhea", "१४ दिन", "पोषणको लागि"]
  },
  24: {
    description: "रोहन, उमेर 5 वर्ष, तौल 15 केजी। बच्चालाई ज्वरो छ। बच्चा malaria प्रभावित क्षेत्रबाट आएको हो।",
    questions: ["Malaria को suspicion हुन्छ कि हुँदैन ?", "कुन test गर्नुपर्छ ?", "Classification के हुन्छ ?", "Management के गर्ने ?"],
    answers: ["हो", "Rapid Diagnostic Test (RDT)", "Malaria", "ACT औषधि"]
  },
  25: {
    description: "माया, उमेर 2 वर्ष, तौल 9 केजी। बच्चाको आँखामा Bitot spot देखिएको छ। बच्चालाई राति राम्रोसँग देख्न गाह्रो हुन्छ।",
    questions: ["Classification के हुन्छ ?", "Vitamin A deficiency का संकेत के हुन् ?", "Vitamin A dose कति दिने ?", "खानपान सम्बन्धी के सल्लाह दिने ?"],
    answers: ["Vitamin A deficiency", "Bitot spot, रतन्धो", "उमेरअनुसार", "भिटामिन ए युक्त खाना"]
  },
  26: {
    description: "दिपेश, उमेर 11 महिना, तौल 6.5 केजी। बच्चाले राम्रोसँग खान सक्दैन। बच्चा सुस्त छ। दुवै खुट्टा सुन्निएका छन्।",
    questions: ["Severe malnutrition छ कि छैन ?", "Classification के हुन्छ ?", "तुरुन्त Management के गर्ने ?", "Referral किन आवश्यक छ ?"],
    answers: ["छ", "Severe Malnutrition", "Referral", "गम्भीर अवस्था"]
  },
  27: {
    description: "अनु, उमेर 3 वर्ष, तौल 12 केजी। बच्चालाई कान दुखेको छ। कान रातो छ तर पिप आएको छैन।",
    questions: ["Classification के हुन्छ ?", "Acute ear infection हो कि होइन ?", "Pain management कसरी गर्ने ?", "Follow up कहिले गर्ने ?"],
    answers: ["Acute ear infection", "हो", "Pain reliever", "५ दिनमा"]
  },
  28: {
    description: "किरण, उमेर 4 वर्ष, तौल 13 केजी। बच्चालाई खोकी छ। सास 44/min छ। छाती तानिएको छैन।",
    questions: ["Fast breathing छ कि छैन ?", "Classification के हुन्छ ?", "Pneumonia को Management के हो ?", "कुन antibiotic दिने ?"],
    answers: ["छैन", "No pneumonia, cough or cold", "अनावश्यक", "खोकीको उपचार"]
  },
  29: {
    description: "स्मृति, उमेर 9 महिना, तौल 6 केजी। बच्चालाई झाडापखाला छ। आँखा गाडिएका छन्। बच्चा सुस्त छ र पानी पिउन सक्दैन।",
    questions: ["Severe dehydration छ कि छैन ?", "Classification के हुन्छ ?", "कुन Treatment Plan लागू हुन्छ ?", "तुरुन्त Referral आवश्यक छ कि छैन ?"],
    answers: ["छ", "Severe dehydration", "Plan C", "हो"]
  },
  30: {
    description: "अमृत, उमेर 2 वर्ष, तौल 10 केजी। बच्चालाई ज्वरो छ। शरीरमा measles को दाना छ। मुखभित्र घाउ छन् र बच्चाले खान मानेको छैन।",
    questions: ["Measles with eye/mouth complication हो कि होइन ?", "Classification के हुन्छ ?", "Vitamin A आवश्यक छ कि छैन ?"],
    answers: ["हो", "Measles with complication", "छ"]
  },
};
