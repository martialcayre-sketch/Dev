// src/types.ts
var NEUROTRANSMITTER_THEMES = [
  { prefix: "d", label: "Dopamine", description: "Motivation, plaisir, r\xE9compense" },
  { prefix: "n", label: "Noradr\xE9naline", description: "Attention, vigilance, \xE9nergie" },
  { prefix: "s", label: "S\xE9rotonine", description: "Humeur, bien-\xEAtre, sommeil" },
  { prefix: "m", label: "M\xE9latonine", description: "Sommeil, rythme circadien" }
];

// src/questionnaires/alimentaire/evaluation-des-apports-caloriques-et-proteiques-alimentaires-selon-le-pr-l-monnier-def-patient.ts
var evaluation_des_apports_caloriques_et_proteiques_alimentaires_selon_le_pr_l_monnier_def_patient = {
  metadata: {
    id: "evaluation-des-apports-caloriques-et-proteiques-alimentaires-selon-le-pr-l-monnier-def-patient",
    title: `evaluation des apports caloriques et proteiques alimentaires selon le pr l monnier def patient`,
    category: "alimentaire"
  },
  questions: [
    {
      id: "block-01",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Questionnaire :  Evaluation des apports caloriques et prot\xE9iques alimentaires selon le professeur L. Monnier  Groupes d\u2019aliments ou comportements   Nombre de  portions  Prot\xE9ines par  portion  Apports en  prot\xE9ines  Apports en  calories  Portions de viande par jour   ?  Petite portion 100 g   20 g  Portion moyenne 125 g   25 g  Grande portion 150 g   30 g  Portion d\u2019\xE9quivalent viande   par semaine ?  2 \u0153ufs   3,6   g  150 g de poissons   3 ,6   g  Portion s   de produits laitiers par jour ?  200 ml de lait   7 g  1 yaourt   3,5 g  30 g de fromage   7 g  100 g de fromage blanc   7 g  Portion s   de pain ou \xE9quivalent par jour ?  50 g de pain   5 g  1 biscotte   1,25 g  30 gr C\xE9r\xE9ales type Corn   Flakes   5 g  Ajout forfaitaire en fonction du sexe  Prot\xE9ine forfaitaire pour 1 homme   15 g  Prot\xE9ine forfaitaire pour 1 femme   10 g  Calcul de la 1 re   partie  Conversion en calories   X 24  Question suppl\xE9mentaire  Grignotage ?  Grignotage mod\xE9r\xE9   150 calories  Grignotage important   300 calories  Boissons sucr\xE9es ou alcoolis\xE9es par jour  1 verre de vin 120 ml   70 calories  1 verre de bi\xE8re 120 ml   70 calories  1 verre de jus de fruits 120 ml   70   calories  30 ml d\u2019ap\xE9ritif   70 calories  Entr\xE9e sal\xE9e par semaine ?  Tarte sal\xE9e   50 calories  Charcuterie   50 calories  Dessert sucr\xE9 par semaine ?  Tarte sucr\xE9e g\xE2teaux   50 calories  Cr\xE8me glac\xE9e ou autres sucreries   50 calories  Repas festif par semaine ?  1 repas festif par semaine = 200 calories   200 calories  Apports totaux en calories  Apports totaux en prot\xE9ines`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/alimentaire/monnier-def-pro.ts
var monnier_def_pro = {
  metadata: {
    id: "monnier-def-pro",
    title: `monnier def pro`,
    category: "alimentaire"
  },
  questions: [
    {
      id: "block-01",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Questionnaire :  Evaluation des apports caloriques et prot\xE9iques alimentaires selon le professeur L. Monnier  Groupes d\u2019aliments ou comportements   Nombre de  portions  Prot\xE9ines par  portion  Apports en  prot\xE9ines  Apports en  calories  Portions de viande par jour   ?  Petite portion 100 g   20 g  Portion moyenne 125 g   25 g  Grande portion 150 g   30 g  Portion d\u2019\xE9quivalent viande   par semaine   ?  2 \u0153ufs   3,6   g  150 g de poissons   3 ,6   g  Portion s   de produits laitiers par jour ?  200 ml de lait   7 g  1 yaourt   3,5 g  30 g de fromage   7 g  100 g de fromage blanc   7 g  Portion s   de pain ou \xE9quivalent par jour ?  50 g de pain   5 g  1 biscotte   1,25 g  30 gr C\xE9r\xE9ales type Corn   Flakes   5 g  Ajout forfaitaire en fonction du sexe  Prot\xE9ine forfaitaire pour 1 homme   15 g  Prot\xE9ine forfaitaire pour 1 femme   10 g  Calcul de la 1 re   partie  Conversion en calories   X 24  Question suppl\xE9mentaire  Grignotage ?  Grignotage mod\xE9r\xE9   150 calories  Grignotage important   300 calories  Boissons sucr\xE9es ou alcoolis\xE9es par jour  1 verre de vin 120 ml   70 calories  1 verre de bi\xE8re 120 ml   70 calories  1 verre de jus de fruits 120 ml   70   calories  30 ml d\u2019ap\xE9ritif   70 calories  Entr\xE9e sal\xE9e par semaine ?  Tarte sal\xE9e   50 calories  Charcuterie   50 calories  Dessert sucr\xE9 par semaine ?  Tarte sucr\xE9e g\xE2teaux   50 calories  Cr\xE8me glac\xE9e ou autres sucreries   50 calories  Repas festif par semaine ?  1 repas festif par semaine = 200 calories   200 calories  Apports totaux en calories  Apports totaux en prot\xE9ines`,
      type: "textarea"
    },
    {
      id: "block-02",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Interpr\xE9tation de l\u2019enqu\xEAte de Monnier pour le professionnel de sant\xE9  Le questionnaire d\u2019\xE9valuation des apports caloriques et prot\xE9iques selon Monnier est un outil   simple, rapide , efficace et   scientifiquement valid\xE9   permettant une estimation des apports caloriques, une estimation des apports prot\xE9iques et un rep\xE9rage des comportements g\xE9n\xE9rateurs de \xAB calories vides \xBB.  Il est utilis\xE9 en pratique quotidienne pour un rep\xE9rage rapide de l\u2019apport \xE9nerg\xE9tique total et une enqu\xEAte \xAB flash \xBB des comportements alimentaires \xE9ventuels \xE0 modifier.  Il est pertinent de l\u2019utiliser dans une approche des patients en surpoids mais \xE9galement pour une enqu\xEAte alimentaire rapide pour la plupart des patients (par exemple pour une \xE9valuation des apports prot\xE9in\xE9s chez la personne au-del\xE0 de 60 ans).`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/alimentaire/questionnaire-alimentaire-de-diete-mediterraneenne-def.ts
var questionnaire_alimentaire_de_diete_mediterraneenne_def = {
  metadata: {
    id: "questionnaire-alimentaire-de-diete-mediterraneenne-def",
    title: `questionnaire alimentaire de diete mediterraneenne def`,
    category: "alimentaire"
  },
  questions: [
    {
      id: "block-01",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Questionnaire :  Alimentation, di\xE8te m\xE9diterran\xE9enne  Questions :  Utilisez - vous de l\u2019huile d\u2019olive comme huile principale de cuisine ?   Oui  Combien de cuill\xE8res \xE0 soupe d\u2019huile d\u2019olive consommez - vous chaque jour ?   <4  Combien de portions de l\xE9gumes consommez - vous chaque jour ?   ( Une   portion de 200 g)   >2  Combien de fruits (y compris jus de fruits frais) consommez - vous chaque jour ?   >3  Combien de portions de viande rouge, hamburger ou charcuterie consommez - vous  chaque jour ? (Une portion = 100-150 g)  <1  Combien de portions de beurre, margarine, cr\xE8me fra\xEEche consommez-vous quotidiennement ? (Une portion \xE9gale 12 g)  <1  Combien de sucreries, boissons sucr\xE9es ou soda consommez-vous chaque jour ?   <1  Combien de verres de   vin   buvez-vous par semaine ?   >7   verres  Combien de portions de l\xE9gumes secs consommez-vous chaque semaine ? (Une portion : 150 g)  >3  Combien de portions de poissons, coquillages ou crustac\xE9s consommez-vous par semaine ? (Une portion : 100 -150 g, poissons : 4 ou 5 coquillages)  >3  Combien de fois par semaine consommez-vous des p\xE2tisseries industrielles, cookies, biscuit\u2026 ?  <3  Combien de portions de noix consommez-vous chaque semaine ? (Une portion : 30 g)   >3  Consommez-vous pr\xE9f\xE9rentiellement des volailles, poulet, dinde, lapin\u2026 Plut\xF4t que du veau, du porc, du b\u0153uf, des saucisses, des hamburgers\u2026 ?  Oui  Combien de fois par semaine consommez-vous des l\xE9gumineuses, des p\xE2tes, du riz complet ou d\u2019autres plats assaisonn\xE9s avec sauce tomate, oignon, ail, condiments, aromates et \xE0 l\u2019huile d\u2019olive ?  >2`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/alimentaire/questionnaire-alimentaire-siin-def-pro.ts
var questionnaire_alimentaire_siin_def_pro = {
  metadata: {
    id: "questionnaire-alimentaire-siin-def-pro",
    title: `questionnaire alimentaire siin def pro`,
    category: "alimentaire"
  },
  questions: [
    {
      id: "block-01",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Questionnaire :  Enqu\xEAte alimentaire SiiN  Concernant vos habitudes alimentaires courantes\u2026  Votre r\xE9ponse  Si vous avez r\xE9pondu\u2026  Alors comptez \u2026 points  Votre score (0,1 ou 2)  Combien de verres d\u2019eau ou de litres d\u2019eau  buvez-vous chaque jour ?  (en incluant \xE9galement les tasses de th\xE9, tisanes ou infusions, caf\xE9\u2026)  >12 verres ou >1,5l  1  Combien de tasses de caf\xE9 buvez-vous chaque jour ?  1 \xE0 5   1  Combien de tasses de th\xE9 buvez-vous chaque jour ?  1 \xE0 5   1  Combien de jus de fruits, sans sucre rajout\xE9, buvez-vous chaque jour ?  0 \xE0 1   1  Combien de boissons sucr\xE9es, sodas, cola, limonade\u2026 buvez-vous chaque jour ?  0 ou <1  (Pas tous les jours)  1  Combien de verres de vin buvez-vous en moyenne chaque jour ?  0,1 ou <2   1  Combien de verres de vin ou boissons alcoolis\xE9es buvez-vous chaque semaine ?  <10   2  Combien de portions d\u2019environ 80 g de l\xE9gumes consommez-vous chaque jour ?  >5   2  Combien de fruits entiers consommez- vous chaque jour ?  1,2 ou 3   2  Combien de portions de c\xE9r\xE9ales compl\xE8tes ou semi compl\xE8tes consommez- vous chaque jour ? (Portion d\u2019environ 80 \xE0 100 g de riz complet, quinoa, flocons\u2026)  1 ou 2   1  Consommez-vous pr\xE9f\xE9rentiellement, au moins une fois sur 2, des c\xE9r\xE9ales compl\xE8tes plut\xF4t que les c\xE9r\xE9ales raffin\xE9es (bl\xE9 complet farine compl\xE8te, riz complet, p\xE2tes compl\xE8tes\u2026)  Oui   2  Consommez-vous pr\xE9f\xE9rentiellement du pain complet plut\xF4t que du pain blanc, baguettes ?  Oui   2  Combien de portions de l\xE9gumes secs consommez-vous chaque semaine ? (Une portion : 150 g)  3 ou +   2  Combien de portions de noix \xAB de Grenoble \xBB consommez-vous chaque semaine (une portion : 30 g) ?  3 ou +   2  Combien de portions de fruits secs (non sucr\xE9s et non sal\xE9s) tels que les amandes,  3 ou +   2`,
      type: "textarea"
    },
    {
      id: "block-02",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  noisettes, pistaches, noix de cajou, du Br\xE9sil\u2026 consommez-vous chaque semaine ?  Utilisez-vous de l\u2019huile de colza comme huile principale de cuisine ou d\u2019assaisonnement ?  Oui   2  Combien de cuill\xE8res \xE0 soupe d\u2019huile de colza consommez-vous chaque jour ?  >2   2  Combien de portions de beurre, margarine, cr\xE8me fra\xEEche, graisses de coco consommez-vous quotidiennement ? (Une portion \xE9gale 12 g)  <1   2  Utilisez-vous des huiles de tournesol, huile de ma\xEFs ou de p\xE9pin de raisin comme huile principale ou r\xE9guli\xE8re de cuisine ?  Non   2  Combien de sauces \xAB industrielles \xBB type mayonnaise, sauce salade, sauce barbecue\u2026 (hormis celles qui sont pr\xE9par\xE9es \xE0 base d\u2019huile de colza) consommez-vous chaque jour  0 ou < 1  Pas tous les jours  2  Combien de produits laitiers frais, non sucr\xE9s consommez-vous chaque jour ?  (Yaourt, fromage blanc ou petit-suisse\u2026)  1 ou 2   1  Combien de produits laitiers frais et sucr\xE9s consommez-vous chaque jour ?  Yaourt aux fruits, yaourt sucr\xE9, desserts lact\xE9s aromatis\xE9s sucr\xE9s\u2026)  <1   1  Combien de portions de fromage consommez-vous chaque jour ?  0 ou 1   1  Combien de portions fromage \xAB gras \xBB consommez-vous par semaine ?  <4   1  Combien d\u2019\u0153ufs issus de la fili\xE8re om\xE9ga 3 consommez-vous chaque semaine ?  4 \xE0 14   2  Combien d\u2019\u0153ufs, issus de fili\xE8res conventionnelles, bio ou plein air mais non om\xE9ga 3 consommez-vous chaque semaine ?  <5   1  Combien de portions de poissons gras (sardine, maquereau, hareng, saumon, thon... Consommez-vous par semaine ? (portions de 100 g)  2 ou plus   2  Combien de portions de 100 g de poisson, tout-venant (y compris les poissons gras pr\xE9c\xE9dents), consommez-vous chaque semaine ?  4   1  Combien de portions de coquillages ou crustac\xE9s consommez-vous par semaine ? (Une portion : 4 ou 5 coquillages)  >1   1  Combien de portions de viande blanche ou volaille consommez-vous chaque semaine ? (Poulet, dinde, canard, lapin, porc\u2026)  2 \xE0 3   1`,
      type: "textarea"
    },
    {
      id: "block-03",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Combien de portions de viande rouge, hamburger consommez-vous chaque semaine ? (une portion = 100 \xE0 150 g)  < 3 fois ou < 350g  2  Consommez-vous pr\xE9f\xE9rentiellement des volailles, poulet, dinde, lapin\u2026 Plut\xF4t que du veau, du b\u0153uf, des saucisses, des hamburgers\u2026 ?  Oui   1  Combien de portions de charcuteries consommez-vous chaque semaine ?  < 3 fois ou < 140g  2  Combien de pommes de terre consommez-vous chaque semaine ?  (Frites, pur\xE9e, pommes vapeur\u2026)  < 3   1  Combien de portions de p\xE2tes blanches, raffin\xE9es non compl\xE8tes, de riz blanc ou de pain blanc comme la baguette consommez-vous chaque semaine ?  < 3   1  Consommez-vous r\xE9guli\xE8rement ou quotidiennement des produits sucr\xE9s industrialis\xE9s tels que les confitures, p\xE2te chocolat\xE9e \xE0 tartiner, c\xE9r\xE9ales de petit d\xE9jeuner sucr\xE9es\u2026  Non   2  Combien de fois par semaine consommez- vous des p\xE2tisseries industrielles, cookies, biscuits\u2026 ?  < 2   2  L\u2019achat ou la consommation de boissons sucr\xE9es telles que les limonades, les jus de fruits industriels, les sodas\u2026 (m\xEAme les boissons Light ou all\xE9g\xE9es) sont pour moi occasionnelles, jamais quotidiennes.  Oui   2  Lors de mes achats en grande surface, la part de produits transform\xE9s, industrialis\xE9s, \xAB pr\xEAts \xE0 \xEAtre consomm\xE9s \xBB repr\xE9sente moins d\u2019un cinqui\xE8me de mon caddy\u2026  Oui   2  J\u2019ach\xE8te parfois du sucre (sucre blanc, sucre roux, sucre de canne\u2026) mais j\u2019en utilise tr\xE8s peu, je rajoute moins d\u2019une cuill\xE8re \xE0 soupe par jour dans ma consommation, y compris les boissons telles que caf\xE9, th\xE9, tisanes\u2026  Oui   2  Je rajoute du sel fr\xE9quemment dans ma cuisson ou dans mon assiette.  Non   1  J\u2019ach\xE8te et je consomme assez souvent des produits industrialis\xE9s sal\xE9s tels que des chips, des fruits secs ap\xE9ritifs sal\xE9s, des cacahu\xE8tes sal\xE9es\u2026  Non   2  Combien de fois par semaine consommez- vous des plats assaisonn\xE9s naturellement avec sauce tomate, oignon, ail, curry, curcuma, gingembre, moutarde, condiments, aromates ?  >2   2  Consommez-vous chaque jour des \xE9pices, des aromates, des herbes aromatiques,  Oui   2`,
      type: "textarea"
    },
    {
      id: "block-04",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  condiments\u2026 directement sur la table ou lors de vos pr\xE9parations et recettes ?  Consommez-vous chaque jour un ou plusieurs des aliments suivants : du chocolat noir (>70% cacao) des agrumes (citrons, oranges, mandarines\u2026), des petits fruits rouges (groseille, framboise, cassis, raisin\u2026 frais ou surgel\xE9s) du th\xE9 vert ?  Oui   2  Consommez-vous chaque semaine un ou plusieurs des aliments suivants : brocolis, choux (choux verts, choux rouges, choux de Bruxelles etc.) et/ou des champignons, des algues, du soja ?  Oui   2  Je suis tr\xE8s attentif aux temp\xE9ratures de cuisson, j\u2019\xE9vite les cuissons \xE0 haute temp\xE9rature, les barbecues, l\u2019exc\xE8s de \xAB brunissement \xBB comme sur le pain grill\xE9 ou les fritures\u2026  Oui   2  \xC0 chaque fois que cela est possible, je m\u2019oriente vers une consommation de produits bio plus particuli\xE8rement sur les l\xE9gumes, les fruits, les c\xE9r\xE9ales compl\xE8tes, le pain complet\u2026  Oui   1  Je suis attentif aux fili\xE8res de production et j\u2019ach\xE8te notamment des produits issus de la fili\xE8re om\xE9ga 3 \xE0 chaque fois que cela est possible.  Oui   1  Je mange r\xE9guli\xE8rement et j\u2019\xE9vite les grignotages entre les repas.  Oui   2  Je mange r\xE9guli\xE8rement au restaurant, \xAB sur le pouce \xBB ou des plats de \xAB restauration rapide \xBB ou des plats \xAB tout pr\xEAts \xE0 r\xE9chauffer \xBB.  Non   1  Je prends chaque jour un petit d\xE9jeuner complet, copieux, riche en prot\xE9ines (\u0153ufs, jambon, poissons, fromages ou yaourts de lait ou de soja, amandes\u2026) et pauvre en aliments sucr\xE9s (sucre, confiture, miel, produits sucr\xE9s industriels\u2026).  Oui   2  Je consomme r\xE9guli\xE8rement au cours de mon petit d\xE9jeuner des aliments source de prot\xE9ines\u2026  Oui   2  Habituellement, entre la fin de mon repas du soir et mon petit-d\xE9jeuner il s\u2019\xE9coule environ au moins 10 heures (exemple : fin du repas 21heures et petit d\xE9jeuner \xE0 07 heures le matin).  Oui   2  je privil\xE9gie un petit d\xE9jeuner et un d\xE9jeuner copieux avec un repas du soir l\xE9ger et digeste.  Oui   1`,
      type: "textarea"
    },
    {
      id: "block-05",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Commentaire pour le professionnel de sant\xE9 et de soins : \xAB Pro \xBB  Le questionnaire d\u2019enqu\xEAte alimentaire SIIN explore de fa\xE7on simple et rapide un grand nombre d\u2019items correspondant aux comportements protecteurs de la sant\xE9 inspir\xE9 du mod\xE8le m\xE9diterran\xE9en et enrichi des connaissances r\xE9centes en nutrition.  Le score total refl\xE8te l\u2019adh\xE9sion \xE0 un r\xE9gime alimentaire sain et durable.  Un score < 25 :   correspond \xE0 une alimentation   tr\xE8s d\xE9s\xE9quilibr\xE9e et d\xE9favorable , facteur de risque de maladies. Le comportement alimentaire global contribue \xE0 l\u2019\xE9mergence de pathologies.  Un changement alimentaire s\u2019impose en d\xE9butant par les items les plus perturb\xE9s et/ou par des comportements accessibles par le patient en fonction de son degr\xE9 d\u2019investissement et de motivation  Un score de 26 \xE0 50 :   correspond \xE0 une alimentation   d\xE9s\xE9quilibr\xE9e , ne contribuant pas au maintien d\u2019un capital sant\xE9. Plusieurs items de comportements contribuent de fa\xE7on synergique au d\xE9veloppement de nombreuses maladies. Une r\xE9forme alimentaire s\u2019impose en tenant compte de la motivation et de l\u2019investissement du patient mais \xE9galement de diff\xE9rents facteurs les plus perturb\xE9s.  Un score de 51 \xE0 70 :   correspond \xE0 une alimentation plut\xF4t   \xE9quilibr\xE9e mais insuffisamment protectrice   vis-\xE0-vis des maladies de civilisation, l\u2019\xE9volution des maladies cardiovasculaires inflammatoires m\xE9taboliques et neuropsychiatriques\u2026  En tenant compte des diff\xE9rentes r\xE9ponses, il est possible de choisir un ou plusieurs comportements pouvant \xEAtre am\xE9lior\xE9.  Score > 71 :   Correspond \xE0 une alimentation optimale contribuant \xE0 la protection du capital sant\xE9 et limitant l\u2019apparition de nombreuses maladies de civilisation. Cette attitude doit \xEAtre encourag\xE9e et entour\xE9e de conseil de mode de vie favorable (sommeil, activit\xE9 physique, gestion du stress\u2026).  Je lis les \xE9tiquettes, le Nutri score, je fais  attention \xE0 la composition et provenance des produits que j\u2019ach\xE8te en grande surface.  Oui   1  J\u2019\xE9vite la consommation r\xE9guli\xE8re ou quotidienne d\u2019\xE9dulcorants intenses (aspartame, N\xE9otame, ac\xE9sulfame K\u2026) qu\u2019il s\u2019agisse de \xAB sucrettes \xBB rajout\xE9es ou d\u2019\xE9dulcorants dans les produits.  Oui   2`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/cancerologie/questionnaire-cancero-qlq-br23-def-pro.ts
var questionnaire_cancero_qlq_br23_def_pro = {
  metadata: {
    id: "questionnaire-cancero-qlq-br23-def-pro",
    title: `Questionnaire QLQ-BR23`,
    category: "cancerologie"
  },
  questions: [
    {
      id: "q1",
      label: `Avez-vous eu la bouche s\xE8che ? 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q2",
      label: `La nourriture et la boisson avaient-elles un go\xFBt 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q3",
      label: `Est-ce que vos yeux \xE9taient irrit\xE9s, larmoyants, ou 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q4",
      label: `Avez-vous perdu des cheveux ? 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q5",
      label: `R\xE9pondez \xE0 cette question uniquement si vous avez 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q6",
      label: `Vous \xEAtes-vous sentie malade ou souffrante ? 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q7",
      label: `Avez-vous eu des bouff\xE9es de chaleur ? 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q8",
      label: `Avez-vous eu mal \xE0 la t\xEAte ? 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q9",
      label: `Vous \xEAtes-vous sentie moins attirante du fait de votre 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q10",
      label: `Vous \xEAtes-vous sentie moins f\xE9minine du fait de votre 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q11",
      label: `Avez-vous trouv\xE9 difficile de vous regarder nue ? 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q12",
      label: `Votre corps vous a-t-il d\xE9plu ? 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q13",
      label: `Vous \xEAtes-vous inqui\xE9t\xE9e pour votre sant\xE9 pour 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q14",
      label: `Dans quelle mesure vous \xEAtes-vous int\xE9ress\xE9e \xE0 la 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q15",
      label: `Avez-vous eu une activit\xE9 sexuelle quelconque (avec 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q16",
      label: `R\xE9pondez \xE0 cette question uniquement si vous avez 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q17",
      label: `Avez-vous eu mal au bras ou \xE0 l\u2019\xE9paule ? 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q18",
      label: `Avez-vous eu la main ou le bras enfl\xE9 ? 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q19",
      label: `Avez-vous eu du mal \xE0 lever le bras ou \xE0 le d\xE9placer 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q20",
      label: `Avez-vous ressenti des douleurs dans la r\xE9gion du 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q21",
      label: `La r\xE9gion de votre sein trait\xE9 \xE9tait-elle enfl\xE9e ? 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q22",
      label: `La r\xE9gion de votre sein trait\xE9 \xE9tait-elle 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q23",
      label: `Avez-vous eu des probl\xE8mes de peau dans la r\xE9gion 1 2 3 4`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/cancerologie/questionnaire-cancero-qlq-c30-def-pro.ts
var questionnaire_cancero_qlq_c30_def_pro = {
  metadata: {
    id: "questionnaire-cancero-qlq-c30-def-pro",
    title: `Questionnaire QLQ-C30`,
    category: "cancerologie"
  },
  questions: [
    {
      id: "q1",
      label: `Avez-vous des difficult\xE9s \xE0 faire certains efforts 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q2",
      label: `Avez-vous des difficult\xE9s \xE0 faire une longue 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q3",
      label: `Avez-vous des difficult\xE9s \xE0 faire un petit tour dehors ? 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q4",
      label: `Etes-vous oblig\xE9(e) de rester au lit ou dans un fauteuil 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q5",
      label: `Avez-vous besoin d\u2019aide pour manger, vous habiller, 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q6",
      label: `Avez-vous \xE9t\xE9 g\xEAn\xE9(e) pour effectuer votre travail ou 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q7",
      label: `Avez-vous \xE9t\xE9 g\xEAn\xE9(e) dans vos activit\xE9s de loisirs ? 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q8",
      label: `Avez-vous le souffle court ? 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q9",
      label: `Avez-vous ressenti de la douleur ? 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q10",
      label: `Avez-vous eu besoin de repos ? 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q11",
      label: `Avez-vous eu des difficult\xE9s \xE0 dormir ? 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q12",
      label: `Vous \xEAtes-vous senti(e) faible ? 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q13",
      label: `Avez-vous manqu\xE9 d\u2019app\xE9tit ? 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q14",
      label: `Avez-vous eu des naus\xE9es (mal au c\u0153ur) ? 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q15",
      label: `Avez-vous vomi ? 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q16",
      label: `Avez-vous \xE9t\xE9 constip\xE9e ? 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q17",
      label: `Avez-vous eu de la diarrh\xE9e ? 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q18",
      label: `Avez-vous \xE9t\xE9 fatigu\xE9(e) ? 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q19",
      label: `Des douleurs ont-elles perturb\xE9 vos activit\xE9s 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q20",
      label: `Avez-vous eu des difficult\xE9s \xE0 vous concentrer sur 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q21",
      label: `Vous \xEAtes-vous senti(e) tendu(e) ? 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q22",
      label: `Vous \xEAtes-vous fait du souci ? 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q23",
      label: `Vous \xEAtes-vous senti(e) irritable ? 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q24",
      label: `Vous \xEAtes-vous senti(e) d\xE9prim\xE9(e) ? 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q25",
      label: `Avez-vous des difficult\xE9s \xE0 vous souvenir de certaines 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q26",
      label: `Votre \xE9tat physique ou votre traitement m\xE9dical vous 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q27",
      label: `Votre \xE9tat physique ou votre traitement m\xE9dical vous 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q28",
      label: `Votre \xE9tat physique ou votre traitement m\xE9dical vous`,
      type: "textarea"
    },
    {
      id: "q29",
      label: `Comment \xE9valueriez-vous votre \xE9tat de sant\xE9 au cours de la semaine pass\xE9e ?`,
      type: "textarea"
    },
    {
      id: "q30",
      label: `Comment \xE9valueriez-vous l\u2019ensemble de votre qualit\xE9 de vie au cours de la semaine pass\xE9e ?`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/cardiologie/questionnaire-troubles-fonctionnels-cardio-metabolique-def-pro.ts
var questionnaire_troubles_fonctionnels_cardio_metabolique_def_pro = {
  metadata: {
    id: "questionnaire-troubles-fonctionnels-cardio-metabolique-def-pro",
    title: `questionnaire troubles fonctionnels cardio metabolique def pro`,
    category: "cardiologie"
  },
  questions: [
    {
      id: "block-01",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Questionnaire :  Les troubles fonctionnels cardio-m\xE9taboliques  Cotation : comptabilisez les points attribu\xE9s \xE0 chaque r\xE9ponse positive   Si oui,  notez\u2026points  Ant\xE9c\xE9dents familiaux   :  Mon p\xE8re a fait un infarctus ou un accident   vasculaire c\xE9r\xE9bral avant 55 ans   1  Ma m\xE8re a fait un infarctus ou un accident vasculaire c\xE9r\xE9bral avant 65 ans   1  J\u2019ai d\xE9j\xE0 \xE9t\xE9 suivi ou diagnostiqu\xE9 pour   :  Des probl\xE8mes de cholest\xE9rol \xE9lev\xE9 ou de triglyc\xE9rides   1  Des probl\xE8mes   d\u2019hypertension art\xE9rielle   2  Un diab\xE8te (ou diab\xE8te gestationnel pour les femmes) ou un taux de glyc\xE9mie \xE9lev\xE9   2  Un probl\xE8me d\u2019ath\xE9rome, d\u2019angine de poitrine   1  Un infarctus, un accident vasculaire thrombo - embolique ou de l\u2019art\xE9rite   2  Une   phl\xE9bite ou une embolie pulmonaire   1  Une insuffisance veineuse   1  Actuellement ou ces trois derni\xE8res ann\xE9es :  Je suis fumeur ou ancien fumeur, je vapote   2  Je prends du poids au niveau de la taille   2  Je suis en surpoids, o\xF9 j\u2019ai fait ant\xE9rieurement des yoyos   2  Je suis migraineux (migraineuse avec \xAB aura \xBB pour les femmes)   1  J\u2019ai un stress chronique   2  Je manque de sommeil   2  Je suis s\xE9dentaire ou tr\xE8s peu actif   2  Score total / 25`,
      type: "textarea"
    },
    {
      id: "block-02",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Commentaires sur l\u2019\xE9chelle \xAB Les troubles fonctionnels cardio-m\xE9taboliques \xBB  Notes pour le professionnel de sant\xE9  Les maladies cardiovasculaires et m\xE9taboliques sont favoris\xE9es par la convergence de plusieurs facteurs de risque. Certains sont facilement identifiables car ils sont li\xE9s \xE0 des ant\xE9c\xE9dents de maladie familiale (facteurs de pr\xE9dispositions g\xE9n\xE9tiques) d\u2019autres sont li\xE9es au mode de vie et sont plus facilement modifiables par un changement de comportement adapt\xE9.  L\u2019\xE9chelle d\u2019\xE9valuation des troubles fonctionnels cardio-m\xE9taboliques permet un recueil simple et rapide associant les ant\xE9c\xE9dents familiaux, des ant\xE9c\xE9dents personnels ou des maladies cardiovasculaires en cours ainsi que le recueil des principaux facteurs de risque notamment le tabagisme, le surpoids abdominal et les variations pond\xE9rales, le stress chronique, la s\xE9dentarit\xE9 et la dette en sommeil.  Selon les donn\xE9es de la litt\xE9rature m\xE9dicale, les diff\xE9rents items seront pond\xE9r\xE9s en fonction de leur influence sur la survenue des risques cardio m\xE9taboliques.  L\u2019Interpr\xE9tation d\xE9finitive et la mise en place de strat\xE9gies \xE9ducatives ou th\xE9rapeutiques doit tenir compte de l\u2019ensemble des donn\xE9es cliniques et du contexte par ailleurs.  Notes pour communiquer au patient  les maladies cardiovasculaires et le diab\xE8te sont des pathologies qui peuvent \xEAtre \xE9vit\xE9es. Elles sont influenc\xE9es par de nombreux facteurs tels que des ant\xE9c\xE9dents de maladies cardiovasculaires ou m\xE9taboliques de votre famille proche, votre \xE9tat de sant\xE9 pass\xE9 ou actuel mais surtout votre mode de vie et vos comportements. Les facteurs h\xE9r\xE9ditaires (g\xE9n\xE9tiques) peuvent \xEAtre modul\xE9s favorablement par l\u2019adoption d\u2019un mode de vie sain : alimentation protectrice, activit\xE9 physique r\xE9guli\xE8re, gestion du stress, respect de l\u2019alternance veille sommeil, poids de sant\xE9\u2026  Ce questionnaire vous permet d\u2019\xE9valuer les points faibles et les points forts pour mieux vous conseiller.`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/gastro-enterologie/questionnaire-de-bristol-pro-def.ts
var questionnaire_de_bristol_pro_def = {
  metadata: {
    id: "questionnaire-de-bristol-pro-def",
    title: `questionnaire de bristol pro def`,
    category: "gastro-enterologie"
  },
  questions: [
    {
      id: "block-01",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Echelle de Bristol  Indiquez sur ce sch\xE9ma votre type de selles habituelles  Description des diff\xE9rents types  Type 1 : Petites crottes dures et d\xE9tach\xE9es, ressemblant \xE0 des noisettes. Difficiles \xE0 \xE9vacuer.  Type 2 : En forme de saucisse, mais dures et grumeleuses.  Type 3 : Comme une saucisse, mais avec des craquelures sur la surface.  Type 4 : Ressemble \xE0 une saucisse ou un serpent, lisse et douce.  Type 5 : Morceaux mous, avec des bords nets (n\xE9anmoins ais\xE9s \xE0 \xE9vacuer).  Type 6 : Morceaux duveteux, en lambeaux, selles d\xE9tremp\xE9es.  Type 7 : Pas de morceau solide, enti\xE8rement liquide.  Cette \xE9chelle a \xE9t\xE9 publi\xE9e par l\u2019universit\xE9 de m\xE9decine de Bristol et a pour but d\u2019identifier puis de classifier l\u2019\xE9tat des selles selon leur aspect, il permet par un rep\xE9rage visuel de faire pr\xE9ciser aux patients l\u2019aspect le plus fr\xE9quemment rencontr\xE9 de ses selles.`,
      type: "textarea"
    },
    {
      id: "block-02",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Interpr\xE9tation des r\xE9sultats  \u2022   Type 1 : Petites crottes dures et d\xE9tach\xE9es, morcel\xE9es, ressemblant \xE0 des noisettes, d\u2019\xE9vacuation difficile  \u2022   Type 2 : En forme de saucisses, mais dures, bossel\xE9es et grumeleuses.  = Constipation  \u2022   Type 3 : Comme une saucisse, mais avec des craquelures sur la surface.  \u2022   Type 4 : Ressemble \xE0 une saucisse ou un serpent, mais de texture lisse et douce.  = Selles normales  \u2022   Type 5 : Morceaux mous, avec des bords nets (n\xE9anmoins ais\xE9s \xE0 \xE9vacuer).  \u2022   Type 6 : Morceaux duveteux, en lambeaux, selles d\xE9tremp\xE9es.  \u2022   Type 7 : Pas de morceaux solides, enti\xE8rement liquide.  = Diarrh\xE9e`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/gastro-enterologie/questionnaire-troubles-fonctionnels-digestifs-et-intestinaux-def-my-et-pro.ts
var questionnaire_troubles_fonctionnels_digestifs_et_intestinaux_def_my_et_pro = {
  metadata: {
    id: "questionnaire-troubles-fonctionnels-digestifs-et-intestinaux-def-my-et-pro",
    title: `Questionnaire :`,
    category: "gastro-enterologie"
  },
  questions: [
    {
      id: "q1",
      label: `Digestifs sup\xE9rieurs (24)`,
      type: "textarea"
    },
    {
      id: "q2",
      label: `Moyen gr\xEAle (21)`,
      type: "textarea"
    },
    {
      id: "q3",
      label: `Transit (15)`,
      type: "textarea"
    },
    {
      id: "q4",
      label: `Selles (18)`,
      type: "textarea"
    },
    {
      id: "q5",
      label: `Douleurs intestinales (15)`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/gastro-enterologie/score-de-francis-des-troubles-fonctionnels-intestinaux-def-pro.ts
var score_de_francis_des_troubles_fonctionnels_intestinaux_def_pro = {
  metadata: {
    id: "score-de-francis-des-troubles-fonctionnels-intestinaux-def-pro",
    title: `score de francis des troubles fonctionnels intestinaux def pro`,
    category: "gastro-enterologie"
  },
  questions: [
    {
      id: "block-01",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Questionnaire :  Score de Francis des troubles fonctionnels intestinaux  Souffrez-vous actuellement de douleurs abdominales ?  \0   Oui  \0   Non  Si oui, quelle est l\u2019intensit\xE9 de ses douleurs abdominales (douleurs au ventre) ?  0%   100%  Veuillez indiquer le nombre de jours au cours desquels vous souffrez sur une p\xE9riode de 10 jours.  Exemple : si votre r\xE9ponse et 4, cela signifie que vous souffrez 4 jours sur 10. Si vous souffrez tous les jours, inscrivez le chiffre 10.  Nombre de jours au cours desquelles vous souffrez : \u2026\u2026\u2026\u2026\u2026\u2026\u2026\u2026. X 10  Souffrez-vous actuellement de probl\xE8me de distension abdominale (ballonnements, ventre gonfl\xE9, tendu) ?  \0   Oui  \0   Non  Si vous \xEAtes une femme, ne tenez pas compte des probl\xE8mes de distension li\xE9e aux r\xE8gles.  Si oui, quelle est l\u2019importance de ces probl\xE8mes de distension abdominale ?  0%   100%  Dans quelle mesure \xEAtes-vous satisfaits (e) de la fr\xE9quence habituelle de vos selles ?  0%   100%  Dans quelle mesure votre syndrome de c\xF4lon irritable affecte ou perturbe votre vie en g\xE9n\xE9ral ?  0%   100%  Aucune  douleur  Douleurs peu  intenses  Douleurs assez intenses  Douleurs intenses   Douleurs tr\xE8s intenses  Aucune distension  Distension peu importante  Distension assez importante  Distension importante   Distension tr\xE8s importante  Tr\xE8s satisfait(e)  Assez satisfait(e)   Pas satisfait(e)   Pas du tout satisfait(e)  Pas du tout   Pas beaucoup   Assez   Totalement`,
      type: "textarea"
    },
    {
      id: "block-02",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Note \xE0 l\u2019attention du professionnel de sant\xE9  le score de Francis   est utilis\xE9 pour \xE9valuer l\u2019intensit\xE9 d\u2019un trouble fonctionnel de l\u2019intestin. Il permet \xE9galement le suivi du patient et l\u2019\xE9valuation de l\u2019impact de votre prise en charge .  Le calcul des points pour les \xE9chelles d\u2019\xE9valuation analogique en pourcentage  Pour l\u2019\xE9tablissement du score, il faut noter la valeur num\xE9rique du pourcentage dans les \xE9chelles analogiques d\u2019\xE9valuation :  Par exemple, dans la question 1b, si le patient \xE0 noter des douleurs d\u2019intensit\xE9 70 %, le score pour cet item sera de 70  Le calcul des points pour les autres questions  Pour calculer le score de ces questions, il faut multiplier par 10 le chiffre inscrit par le patient  Par exemple dans la question 1c, si le patient a r\xE9pondu qu\u2019il souffrait 4 jours sur 10, il a not\xE9 le chiffre \xAB 4 \xBB dans sa case r\xE9ponse, vous attribuez donc une valeur de 40 (4x10) \xE0 cet item pour le calcul du score final.  Le calcul du score final et son interpr\xE9tation  Pour l\u2019\xE9tablissement du score, il vous suffit de faire la somme des points attribu\xE9s pour chaque item :  Score <70 : valeurs normales  Score compris entre 70 et 300 : troubles fonctionnels significatifs, l\u2019intensit\xE9 du trouble ressenti est proportionnelle au score  Score >300 : troubles fonctionnels d\u2019intensit\xE9 s\xE9v\xE8re`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/gerontologie/questionnaire-sarcopenie-pro.ts
var questionnaire_sarcopenie_pro = {
  metadata: {
    id: "questionnaire-sarcopenie-pro",
    title: `questionnaire sarcopenie pro`,
    category: "gerontologie"
  },
  questions: [
    {
      id: "block-01",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Questionnaire :  Sarcop\xE9nie  QUESTION   SCORE  Force  Avez - vous des difficult\xE9s pour soulever et  transporter 4,5 kg de poids ?  Aucune = 0  Un peu = 1  Beaucoup ou incapable = 2  Troubles de la marche  Avez-vous des difficult\xE9s pour traverser une pi\xE8ce ?   Aucune = 0  Un peu = 1  Beaucoup ou incapable = 2  Lever d\u2019une chaise  Avez-vous des difficult\xE9s pour vous lever d\u2019une  chaise ?  Aucune = 0  Un peu = 1  Beaucoup, avec aide ou incapable = 2  Mont\xE9e des escaliers  Avez-vous des difficult\xE9s pour monter 10 marches ?   Aucune = 0  Un peu = 1  Beaucoup, avec aide ou incapable = 2  Chutes  Combien de fois \xEAtes-vous tomb\xE9 dans les 12  derniers mois ?  Pas de chute = 0  1 \xE0 3 chutes = 1  \u2265 4 chutes = 2  Si vous avez un   score sup\xE9rieur ou \xE9gal \xE0 4 , alors on peut   supposer la pr\xE9sence d\u2019une sarcop\xE9nie   et doit donc entra\xEEner un diagnostic plus approfondi. Au contraire, si le score est inf\xE9rieur ou \xE9gal \xE0 3, alors le patient est diagnostiqu\xE9 \xAB non sarcop\xE9nique \xBB mais le patient sera amen\xE9 \xE0 refaire le test si la situation s\u2019aggrave.`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/gerontologie/tinetti.ts
var tinetti = {
  metadata: {
    id: "tinetti",
    title: `NOM : Date :`,
    category: "gerontologie"
  },
  questions: [
    {
      id: "q1",
      label: `\xE9quilibre en - penche ou s\u2019affale 0 10. se mettre en - h\xE9sitation ou diverses 0`,
      type: "select",
      options: [
        { label: ``, value: "" },
        { label: ``, value: "" }
      ]
    },
    {
      id: "q2",
      label: `se mettre - impossible sans aide 0 - ne se d\xE9tache pas du sol 0`,
      type: "select",
      options: [
        { label: ``, value: "" },
        { label: ``, value: "" }
      ]
    },
    {
      id: "q3",
      label: `tentatives pour - impossible sans aide 0 12. sym\xE9trie du - in\xE9galit\xE9 des pas G et D 0`,
      type: "select",
      options: [
        { label: ``, value: "" }
      ]
    },
    {
      id: "q4",
      label: `\xE9quilibre debout - instable (vacille, bouge les 0 13. continuit\xE9 du - arr\xEAts ou discontinuit\xE9 des pas 0`,
      type: "select",
      options: [
        { label: ``, value: "" },
        { label: ``, value: "" }
      ]
    },
    {
      id: "q5",
      label: `\xE9quilibre debout - instable 0 14. marche - nette d\xE9viance 0`,
      type: "select",
      options: [
        { label: ``, value: "" }
      ]
    },
    {
      id: "q6",
      label: `pouss\xE9e sur le - commence \xE0 vaciller 0 15. tronc - mouvement prononc\xE9 du tronc 0`,
      type: "select",
      options: [
        { label: ``, value: "" },
        { label: ``, value: "" }
      ]
    },
    {
      id: "q7",
      label: `yeux ferm\xE9s - instable 0 16. \xE9cartement - talons s\xE9par\xE9s 0`,
      type: "textarea"
    },
    {
      id: "q8",
      label: `rotation de 360\xB0 - petits pas irr\xE9guliers 0`,
      type: "select",
      options: [
        { label: ``, value: "" },
        { label: ``, value: "" },
        { label: ``, value: "" }
      ]
    },
    {
      id: "q9",
      label: `s\u2019asseoir - peu s\xFBr (tombe, calcule mal la 0`,
      type: "select",
      options: [
        { label: ``, value: "" },
        { label: ``, value: "" }
      ]
    }
  ]
};

// src/questionnaires/mode-de-vie/mes-plaintes-actuelles-et-troubles-ressentis.ts
var mes_plaintes_actuelles_et_troubles_ressentis = {
  metadata: {
    id: "mes-plaintes-actuelles-et-troubles-ressentis",
    title: `mes plaintes actuelles et troubles ressentis`,
    category: "mode-de-vie"
  },
  questions: [
    {
      id: "block-01",
      label: `Questionnaire  Page 1/1  Mes plaintes actuelles et troubles ressentis  Des valeurs \xE9lev\xE9es repr\xE9sentent l\u2019intensit\xE9 des troubles actuellement ressentis. 1 = correspond \xE0 l'absence de probl\xE8me et 10 = correspond \xE0 un degr\xE9 maximum de probl\xE8mes et troubles.  Fatigue  10 = je suis tr\xE8s fatigu\xE9(e), \xE9puis\xE9(e) / 1 = j'ai une bonne vitalit\xE9 1   2   3   4   5   6   7   8   9   10  Douleurs  10 = je ressens des douleurs intenses ou chroniques / 1 = je ne ressens aucune douleur 1   2   3   4   5   6   7   8   9   10  Digestion  10 = Je souffre de beaucoup de troubles digestifs et intestinaux / 1 = Je n'ai aucun probl\xE8me de digestion, ni troubles intestinaux 1   2   3   4   5   6   7   8   9   10  Surpoids  10 = J'ai des probl\xE8mes de surpoids importants / 1 = Je n'ai aucun probl\xE8me de poids 1   2   3   4   5   6   7   8   9   10  Insomnie  10 = Je souffre d'insomnie ou de troubles du sommeil / 1 = Je n'ai aucun probl\xE8me de sommeil 1   2   3   4   5   6   7   8   9   10  Moral  10 = Je souffre de beaucoup de troubles d\xE9pressifs ou d'anxi\xE9t\xE9 ou d'angoisse / 1 = J'ai un bon moral, je suis serein(e) 1   2   3   4   5   6   7   8   9   10  Mobilit\xE9  10 = Je souffre de beaucoup de troubles de mobilit\xE9 / 1 = Je n'ai aucun probl\xE8me de mobilit\xE9 1   2   3   4   5   6   7   8   9   10`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/mode-de-vie/questionnaire-contextuel-mode-de-vie-pro-def.ts
var questionnaire_contextuel_mode_de_vie_pro_def = {
  metadata: {
    id: "questionnaire-contextuel-mode-de-vie-pro-def",
    title: `questionnaire contextuel mode de vie pro def`,
    category: "mode-de-vie"
  },
  questions: [
    {
      id: "block-01",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Questionnaire contextuel de mode de vie  Le questionnaire suivant s\u2019int\xE9resse \xE0 votre mode de vie  Pour y r\xE9pondre, soyez spontan\xE9 en r\xE9pondant aux diff\xE9rentes questions, \xE9valuez-vous au cours de ces derni\xE8res semaines.  R\xE9pondez aux questions suivantes en cochant la r\xE9ponse qui vous correspond le plus.  Additionnez les points des r\xE9ponses`,
      type: "textarea"
    },
    {
      id: "block-02",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Votre sommeil  Additionnez les points des r\xE9ponses  Votre score sommeil =  Le score pour les Professionnels de la sant\xE9 et de soins`,
      type: "textarea"
    },
    {
      id: "block-03",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Votre rythme biologique  Votre score rythme biologique =  Le score pour les Professionnels de la sant\xE9 et de soins`,
      type: "textarea"
    },
    {
      id: "block-04",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Votre adaptation et le stress  Votre score adaptation et le stress =  Le score pour les Professionnels de la sant\xE9 et de soins`,
      type: "textarea"
    },
    {
      id: "block-05",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Votre activit\xE9 physique  Votre score activit\xE9 physique =  Le score pour les Professionnels de la sant\xE9 et de soins`,
      type: "textarea"
    },
    {
      id: "block-06",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Votre exposition aux toxiques  Votre score exposition aux toxiques =  Le score pour les Professionnels de la sant\xE9 et de soins`,
      type: "textarea"
    },
    {
      id: "block-07",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Votre relation aux autres  Votre score relation aux autres =  Le score pour les Professionnels de la sant\xE9 et de soins`,
      type: "textarea"
    },
    {
      id: "block-08",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Votre mode alimentaire  Votre score mode alimentaire =  Le score pour les Professionnels de la sant\xE9 et de soins`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/mode-de-vie/questionnaire-dactivite-et-de-depense-energetique-globale-siin-def-pro.ts
var questionnaire_dactivite_et_de_depense_energetique_globale_siin_def_pro = {
  metadata: {
    id: "questionnaire-dactivite-et-de-depense-energetique-globale-siin-def-pro",
    title: `questionnaire dactivite et de depense energetique globale siin def pro`,
    category: "mode-de-vie"
  },
  questions: [
    {
      id: "block-01",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Questionnaire :  Activit\xE9 de d\xE9pense \xE9nerg\xE9tique globale SIIN  1 re   temps : quel est votre niveau d\u2019activit\xE9 ?  Question pos\xE9e/r\xE9ponses   Niveau d\u2019activit\xE9  Que faites-vous lors de votre travail ?  Je reste assis en permanence   Faible  Je me l\xE8ve et marche fr\xE9quemment   Moyen  J\u2019exerce un travail manuel   Fort  Que faites-vous en dehors de votre travail ?  Je reste assis   Faible  J\u2019ai une activit\xE9 sportive de loisirs (une ou plusieurs fois par semaine)   Moyen  J\u2019ai une activit\xE9 sportive de comp\xE9tition   Fort  2 e   temps : quel est votre niveau d\u2019activit\xE9 globale ?  Votre niveau d\u2019activit\xE9 lors de votre travail  Votre niveau d\u2019activit\xE9 en dehors de votre travail  Votre \xE9valuation globale  Faible   Faible   Faible  L\u2019une au moins des 2 est moyenne   Activit\xE9 moyenne  L\u2019une au moins des 2 est forte   Activit\xE9 forte  3 e   temps : quel est votre d\xE9pense \xE9nerg\xE9tique globale estim\xE9e ?  D\xE9pense \xE9nerg\xE9tique globale exprim\xE9e en kilocalories/jour  \xC2ge   Sexe   Activit\xE9 physique  2600   Sujet < 45 ans   Masculin   Moyenne forte  2400   2 crit\xE8res de la ligne du haut sont remplis  2200   Un seul crit\xE8re de la ligne du haut est rempli  2000   Aucun crit\xE8re de la ligne du haut n\u2019est rempli  Commentaire pour conseiller le patient : \xAB My \xBB  L\u2019auto-questionnaire ci-dessus permet de rep\xE9rer de fa\xE7on simple 3 niveaux d\u2019activit\xE9 habituelle dans le cadre de travail et en dehors du travail. Ceci permet de d\xE9terminer quel est votre niveau d\u2019activit\xE9 globale au cours de la journ\xE9e.  Un niveau moyen ou Ford activit\xE9 est associ\xE9 \xE0 une bonne hygi\xE8ne de vie, une meilleure sant\xE9 physique, m\xE9tabolique et mentale. \xC0 l\u2019oppos\xE9, un faible niveau global d\u2019activit\xE9 est consid\xE9r\xE9 comme un facteur de risque de nombreux troubles cardio m\xE9taboliques, pathologies chroniques, mal-\xEAtre, troubles psychologiques\u2026  Les recommandations actuelles pr\xE9conisent une activit\xE9 globale mod\xE9r\xE9e, r\xE9guli\xE8re et quotidienne ainsi que d\u2019\xE9viter la s\xE9dentarit\xE9 excessive.`,
      type: "textarea"
    },
    {
      id: "block-02",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Commentaire pour le professionnel de sant\xE9 et de soins : \xAB Pro \xBB  L\u2019auto-questionnaire d\u2019activit\xE9 de d\xE9pense \xE9nerg\xE9tique permet d\u2019\xE9valuer le niveau global d\u2019activit\xE9 au cours de la journ\xE9e y comprise au travail et en dehors du travail. Cet outil tr\xE8s simple permet d\u2019\xE9tablir un dialogue avec le patient pour l\u2019inviter \xE0 lutter contre la s\xE9dentarit\xE9 et \xE0 adopter au minimum une activit\xE9 mod\xE9r\xE9e, r\xE9guli\xE8re et quotidienne. Pour certains patients, leur travail mais aussi leur mode de vie hors travail leur permet d\u2019avoir un engagement vers une activit\xE9 physique intense.  Une activit\xE9 mod\xE9r\xE9e, quotidienne et r\xE9guli\xE8re est un facteur protecteur de nombreuses pathologies cardio m\xE9taboliques, pr\xE9vention primaire et secondaire de cancers, bien-\xEAtre physique, bien-\xEAtre psychologique et sant\xE9 mentale.  Par ailleurs, ce questionnaire permet d\u2019\xE9valuer de fa\xE7on simple et approximative le niveau de d\xE9pense \xE9nerg\xE9tique globale et peut aider \xE0 d\xE9terminer un niveau d\u2019apport \xE9nerg\xE9tique total par l\u2019alimentation quotidienne.  Le niveau d\u2019activit\xE9 globale module en effet la d\xE9pense \xE9nerg\xE9tique et devrait servir de curseur pour les apports \xE9nerg\xE9tiques (kilocalories) quotidien. Un exemple est fourni pour un sujet jeune de moins de 45 ans masculin.`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/neuro-psychologie/auto-anxiete-def-pro.ts
var auto_anxiete_def_pro = {
  metadata: {
    id: "auto-anxiete-def-pro",
    title: `Questionnaire d\u2019auto-\xE9valuation de l\u2019anxi\xE9t\xE9`,
    category: "neuro-psychologie"
  },
  questions: [
    {
      id: "q1",
      label: `Nervosit\xE9 ou sensation de tremblements 0 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q2",
      label: `Naus\xE9es, douleurs ou malaises d\u2019estomac. 0 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q3",
      label: `Impression d\u2019\xEAtre effray\xE9 subitement et 0 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q4",
      label: `Palpitations ou impression que votre c\u0153ur 0 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q5",
      label: `Difficult\xE9 importante \xE0 vous endormir. 0 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q6",
      label: `Difficult\xE9 \xE0 vous d\xE9tendre. 0 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q7",
      label: `Tendance \xE0 sursauter facilement. 0 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q8",
      label: `Tendance \xE0 \xEAtre facilement irritable ou 0 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q9",
      label: `Incapacit\xE9 \xE0 vous lib\xE9rer de pens\xE9es 0 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q10",
      label: `Tendance \xE0 vous \xE9veiller tr\xE8s t\xF4t le matin 0 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q11",
      label: `Vous sentir nerveux lorsque vous \xEAtes seul. 0 1 2 3 4`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/neuro-psychologie/bdi-echelle-de-depression-de-beck-def-pro.ts
var bdi_echelle_de_depression_de_beck_def_pro = {
  metadata: {
    id: "bdi-echelle-de-depression-de-beck-def-pro",
    title: `bdi echelle de depression de beck def pro`,
    category: "neuro-psychologie"
  },
  questions: [
    {
      id: "block-01",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Questionnaire :  Echelle de d\xE9pression de Beck BDI  Entourez la bonne r\xE9ponse \xE0 chaque question, puis faites le total comme il est indiqu\xE9  en bas de page .  Notez\u2026  points  Question 1  Je ne me sens pas triste   0  Je me sens cafardeux ou triste   1  Je me sens tout le temps cafardeux ou triste, et je n\u2019arrive pas \xE0 en sortir   2  Je suis si triste et sens cafardeux ou triste que je ne peux pas le supporter   3  Question 2  Je ne suis pas particuli\xE8rement d\xE9courag\xE9 ni pessimiste au niveau de l\u2019avenir   0  J\u2019ai le sentiment de d\xE9couragement au sujet de l\u2019avenir   1  Pour mon avenir, je n\u2019ai aucun motif d\u2019esp\xE9rer   2  Je sens qu\u2019il n\u2019y a aucun espoir pour mon avenir, et que la situation ne peut s\u2019am\xE9liorer   3  Question 3  Je n\u2019ai aucun sentiment d\u2019\xE9chec de ma vie   0  J\u2019ai l\u2019impression que j\u2019ai \xE9chou\xE9 dans ma vie plus que la plupart des gens   1  Quand je regarde ma vie pass\xE9e, tout ce que j\u2019y d\xE9couvre n\u2019est qu\u2019\xE9checs   2  J\u2019ai un sentiment d\u2019\xE9chec complet dans toute ma vie personnelle   3  Question 4  Je ne me sens pas particuli\xE8rement insatisfait   0  Je ne sais pas profiter agr\xE9ablement des circonstances   1  Je ne tire plus aucune satisfaction de quoi que ce soit   2  Je   suis m\xE9content de tout   3  Question 5  Je ne me sens pas coupable   0  Je me sens mauvais ou indigne une bonne partie du temps   1  Je me sens coupable   2  Je me juge tr\xE8s mauvais et j\u2019ai l\u2019impression que je ne vaux rien   3  Question 6  Je ne suis pas d\xE9\xE7u par moi - m\xEAme   0  Je   suis d\xE9\xE7u par moi - m\xEAme   1  Je me d\xE9go\xFBte moi - m\xEAme   2  Je me hais   3  Question 7  Je ne pense pas \xE0 me faire du mal   0  Je pense que la mort me lib\xE8rerait   1  J\u2019ai des plans pr\xE9cis pour me suicider   2  Si je le pouvais, je me tuerais   3`,
      type: "textarea"
    },
    {
      id: "block-02",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Question 8  Je n\u2019ai pas perdu   l\u2019int\xE9r\xEAt pour les autres gens   0  Maintenant, je m\u2019int\xE9resse moins aux autres gens qu\u2019autrefois   1  J\u2019ai perdu tout l\u2019int\xE9r\xEAt que je portais aux autres gens, et j\u2019ai peu de sentiments pour eux   2  J\u2019ai perdu tout int\xE9r\xEAt pour les autres, et ils m\u2019indiff\xE8rent   totalement   3  Question 9  Je suis capable de me d\xE9cider aussi facile que de coutume   0  J\u2019essaie de ne pas avoir \xE0 prendre de d\xE9cision   1  J\u2019ai de grandes difficult\xE9s \xE0 prendre des d\xE9cisions   2  Je ne suis plus capable de prendre la moindre d\xE9cision   3  Question 10  Je n\u2019ai   pas le sentiment d\u2019\xEAtre plus laid qu\u2019auparavant   0  Je crains   de para\xEEtre vieux ou disgracieux   1  J\u2019ai l\u2019impression qu\u2019il y a un changement dans mon apparence physique qui me rend disgracieux  2  J\u2019ai l\u2019impression d\u2019\xEAtre laid et repoussant   3  Question 11  Je travaille aussi facilement qu\u2019avant   0  Il me faut un effort suppl\xE9mentaire pour commencer \xE0 faire quelque chose   1  Il faut que je fasse un tr\xE8s grand effort pour faire quoi que ce soit   2  Je suis incapable de faire le moindre travail   3  Question 12  Je ne suis pas plus fatigu\xE9(e) que d\u2019habitude   0  Je suis fatigu\xE9(e) plus facilement que d\u2019habitude   1  Faire quoi que ce soit me fatigue   2  Je suis incapable de faire le moindre travail   3  Question 13  Mon app\xE9tit est toujours aussi bon   0  Mon app\xE9tit n\u2019est pas aussi bon que d\u2019habitude   1  Mon app\xE9tit est beaucoup moins bon maintenant   2  Je n\u2019ai plus du tout d\u2019app\xE9tit   3  Total score   /39`,
      type: "textarea"
    },
    {
      id: "block-03",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Commentaire pour le professionnel de sant\xE9 et de soins : "Pro"  Le questionnaire de Beck ou inventaire de d\xE9pression de Beck (AaronT ; Beck MD) adapt\xE9 en fran\xE7ais par Freston en 1994 permet l\u2019\xE9valuation de l\u2019intensit\xE9 d\u2019un syndrome d\xE9pressif. Il est performant pour l\u2019adulte, moins performant pour la personne \xE2g\xE9e et les adolescents.  C\u2019est un auto-questionnaire qui doit refl\xE9ter dans les r\xE9ponses l\u2019\xE9tat psychologique des 7 derniers jours voire des derni\xE8res semaines. Les sympt\xF4mes doivent \xEAtre pr\xE9sents depuis au moins 3 \xE0 4 semaines.  Score et interpr\xE9tation :  1 \xE0 10 : Variation de l\u2019humeur consid\xE9r\xE9e comme physiologique  11 \xE0 16 : Troubles b\xE9nins de l\u2019humeur mais corrections \xE0 apporter  17 \xE0 20 : Cas limite de d\xE9pression clinique  21 \xE0 30 : D\xE9pression av\xE9r\xE9e  31 \xE0 39 : D\xE9pression grave`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/neuro-psychologie/dependance-a-internet-def-pro.ts
var dependance_a_internet_def_pro = {
  metadata: {
    id: "dependance-a-internet-def-pro",
    title: `Questionnaire :`,
    category: "neuro-psychologie"
  },
  questions: [
    {
      id: "q1",
      label: `A quelle fr\xE9quence vous arrive-t-il de rester sur Internet plus longtemps que pr\xE9vu ?`,
      type: "textarea"
    },
    {
      id: "q2",
      label: `Vous arrive-t-il de n\xE9gliger vos t\xE2ches quotidiennes afin de rester plus longtemps sur le Net?`,
      type: "textarea"
    },
    {
      id: "q3",
      label: `Vous arrive-t-il de pr\xE9f\xE9rer surfer sur Internet plut\xF4t que de sortir avec des ami(e)s ?`,
      type: "textarea"
    },
    {
      id: "q4",
      label: `Vous arrive-t-il de manquer de sommeil \xE0 cause du temps pass\xE9 sur Internet ?`,
      type: "textarea"
    },
    {
      id: "q5",
      label: `Votre entourage se plaint-il du temps que vous consacrez \xE0 Internet ?`,
      type: "textarea"
    },
    {
      id: "q6",
      label: `Votre travail ou vos \xE9tudes souffrent-ils du temps que vous consacrez \xE0 Internet ?`,
      type: "textarea"
    },
    {
      id: "q7",
      label: `Vous arrive-t-il de vous imaginer en train de surfer sur Internet pour vous distraire d'une`,
      type: "textarea"
    },
    {
      id: "q8",
      label: `Vos performances professionnelles diminuent-elles \xE0 cause du temps que vous passez sur`,
      type: "textarea"
    },
    {
      id: "q9",
      label: `Vous arrive-t-il de mentir lorsqu'on vous demande ce que vous \xEAtes occup\xE9 \xE0 faire sur`,
      type: "textarea"
    },
    {
      id: "q10",
      label: `Vous arrive-t-il de relever votre bo\xEEte \xE9lectronique alors que vous avez des priorit\xE9s plus`,
      type: "textarea"
    },
    {
      id: "q11",
      label: `Vous arrive-t-il de constater que vous ne pensez plus qu'\xE0 Internet avant m\xEAme d'y \xEAtre`,
      type: "textarea"
    },
    {
      id: "q12",
      label: `Vous arrive-t-il de penser que la vie serait ennuyeuse, vide et triste sans Internet ?`,
      type: "textarea"
    },
    {
      id: "q13",
      label: `Lorsque quelqu'un vous d\xE9range quand vous \xEAtes sur Internet, ressentez-vous de`,
      type: "textarea"
    },
    {
      id: "q14",
      label: `Vous arrive-t-il de faire de nouvelles connaissances par internet ?`,
      type: "textarea"
    },
    {
      id: "q15",
      label: `Vous arrive-t-il de fantasmer \xE0 propos d'Internet ou d'y penser lorsque vous n'\xEAtes pas en`,
      type: "textarea"
    },
    {
      id: "q16",
      label: `Vous arrive-t-il de vous dire \xAB juste quelques minutes de plus \xBB lorsque le moment est venu`,
      type: "textarea"
    },
    {
      id: "q17",
      label: `Vous arrive-t-il de ne pas respecter vos engagements pour passer davantage de temps sur`,
      type: "textarea"
    },
    {
      id: "q18",
      label: `Mentez-vous \xE0 propos du temps que vous passez sur le Net ?`,
      type: "textarea"
    },
    {
      id: "q19",
      label: `Vous arrive-t-il de pr\xE9f\xE9rer surfer sur Internet plut\xF4t que de passer un moment en`,
      type: "textarea"
    },
    {
      id: "q20",
      label: `Avez-vous remarqu\xE9 que votre cafard ou votre nervosit\xE9 disparaissait d\xE8s que vous vous`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/neuro-psychologie/echelle-ecab-def-pro.ts
var echelle_ecab_def_pro = {
  metadata: {
    id: "echelle-ecab-def-pro",
    title: `Questionnaire`,
    category: "neuro-psychologie"
  },
  questions: [
    {
      id: "q1",
      label: `O\xF9 que j\u2019aille, j\u2019ai besoin d\u2019avoir ce m\xE9dicament avec moi Vrai Faux`,
      type: "textarea"
    },
    {
      id: "q2",
      label: `Ce m\xE9dicament est pour moi comme une drogue Vrai Faux`,
      type: "textarea"
    },
    {
      id: "q3",
      label: `Je pense souvent que je ne pourrai jamais arr\xEAter ce Vrai Faux`,
      type: "textarea"
    },
    {
      id: "q4",
      label: `J\u2019\xE9vite de dire \xE0 mes proches que je prends ce m\xE9dicament Vrai Faux`,
      type: "textarea"
    },
    {
      id: "q5",
      label: `J\u2019ai l\u2019impression de prendre beaucoup trop ce m\xE9dicament Vrai Faux`,
      type: "textarea"
    },
    {
      id: "q6",
      label: `J\u2019ai parfois peur \xE0 l\u2019id\xE9e de manquer de ce m\xE9dicament Vrai Faux`,
      type: "textarea"
    },
    {
      id: "q7",
      label: `Lorsque j\u2019arr\xEAte ce m\xE9dicament, je me sens tr\xE8s malade Vrai Faux`,
      type: "textarea"
    },
    {
      id: "q8",
      label: `Je prends ce m\xE9dicament parce que je ne peux plus m\u2019en Vrai Faux`,
      type: "textarea"
    },
    {
      id: "q9",
      label: `Je prends ce m\xE9dicament parce que je vais mal quand Vrai Faux`,
      type: "textarea"
    },
    {
      id: "q10",
      label: `Je ne prends ce m\xE9dicament que lorsque j\u2019en ressens le Vrai Faux`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/neuro-psychologie/grille-de-zarit-mesure-de-la-charge-des-proches-aidants-def-pro.ts
var grille_de_zarit_mesure_de_la_charge_des_proches_aidants_def_pro = {
  metadata: {
    id: "grille-de-zarit-mesure-de-la-charge-des-proches-aidants-def-pro",
    title: `Questionnaire :`,
    category: "neuro-psychologie"
  },
  questions: [
    {
      id: "q1",
      label: `Sentir que votre parent vous demande plus d\u2019aide qu\u2019il n\u2019en a`,
      type: "textarea"
    },
    {
      id: "q2",
      label: `Sentir que le temps consacr\xE9 \xE0 votre parent ne vous en laisse`,
      type: "textarea"
    },
    {
      id: "q3",
      label: `Vous sentir tiraill\xE9 entre les besoins \xE0 votre parent et vos`,
      type: "textarea"
    },
    {
      id: "q4",
      label: `Vous sentir embarrass\xE9 par le(s) comportement(s) de votre`,
      type: "textarea"
    },
    {
      id: "q5",
      label: `Vous sentir en col\xE8re quand vous \xEAtes en pr\xE9sence de votre`,
      type: "textarea"
    },
    {
      id: "q6",
      label: `Sentir que votre parent nuit \xE0 vos relations avec d\u2019autres`,
      type: "textarea"
    },
    {
      id: "q7",
      label: `Avoir peur de ce que l\u2019avenir r\xE9serve \xE0 votre parent ?`,
      type: "textarea"
    },
    {
      id: "q8",
      label: `Sentir que votre parent est d\xE9pendant de vous ?`,
      type: "textarea"
    },
    {
      id: "q9",
      label: `Vous sentir tendu en pr\xE9sence de votre parent ?`,
      type: "textarea"
    },
    {
      id: "q10",
      label: `Sentir que votre sant\xE9 s\u2019est d\xE9t\xE9rior\xE9e \xE0 cause de votre`,
      type: "textarea"
    },
    {
      id: "q11",
      label: `Sentir que vous n\u2019avez pas autant d\u2019intimit\xE9 que vous`,
      type: "textarea"
    },
    {
      id: "q12",
      label: `Sentir que votre vie sociale s\u2019est d\xE9t\xE9rior\xE9e du fait que vous`,
      type: "textarea"
    },
    {
      id: "q13",
      label: `Vous sentir mal \xE0 l\u2019aise de recevoir des amis \xE0 cause de votre`,
      type: "textarea"
    },
    {
      id: "q14",
      label: `Sentir que votre parent semble s\u2019attendre \xE0 ce que vous`,
      type: "textarea"
    },
    {
      id: "q15",
      label: `Sentir que vous n\u2019avez pas assez d\u2019argent pour prendre`,
      type: "textarea"
    },
    {
      id: "q16",
      label: `Sentir que vous ne serez plus capable de prendre soin de votre`,
      type: "textarea"
    },
    {
      id: "q17",
      label: `Sentir que vous avez perdu le contr\xF4le de votre vie depuis la`,
      type: "textarea"
    },
    {
      id: "q18",
      label: `Souhaiter pouvoir laisser le soin de votre parent \xE0 quelqu\u2019un`,
      type: "textarea"
    },
    {
      id: "q19",
      label: `Sentir que vous ne savez pas trop quoi faire pour votre parent ?`,
      type: "textarea"
    },
    {
      id: "q20",
      label: `Sentir que vous devriez en faire plus pour votre parent ?`,
      type: "textarea"
    },
    {
      id: "q21",
      label: `Sentir que vous pourriez donner de meilleurs soins \xE0 votre`,
      type: "textarea"
    },
    {
      id: "q22",
      label: `En fin de compte, vous arrive-t-il de sentir que les soins \xE0`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/neuro-psychologie/hamilton-def-pro.ts
var hamilton_def_pro = {
  metadata: {
    id: "hamilton-def-pro",
    title: `Questionnaire :`,
    category: "neuro-psychologie"
  },
  questions: [
    {
      id: "q0",
      label: `Non`,
      type: "textarea"
    },
    {
      id: "q1",
      label: `Oui. Etats affectifs signal\xE9s uniquement si on l\u2019interroge (ex. pessimisme,`,
      type: "textarea"
    },
    {
      id: "q2",
      label: `Oui. Etats signal\xE9s spontan\xE9ment et de mani\xE8re verbale ou sonore (ex. par des`,
      type: "textarea"
    },
    {
      id: "q3",
      label: `Oui. Etats communiqu\xE9s de mani\xE8re non verbale (ex. expression faciale, attitude,`,
      type: "textarea"
    },
    {
      id: "q4",
      label: `Oui. La personne ne communique pratiquement que ces \xE9tats affectifs verbalement`,
      type: "textarea"
    },
    {
      id: "q0",
      label: `N\u2019a pas de sentiments de culpabilit\xE9.`,
      type: "textarea"
    },
    {
      id: "q1",
      label: `S\u2019adresse des reproches, et a l\u2019impression d\u2019avoir port\xE9 pr\xE9judice \xE0 des gens.`,
      type: "textarea"
    },
    {
      id: "q2",
      label: `Id\xE9es de culpabilit\xE9 et rumination sur des erreurs pass\xE9es ou des actions`,
      type: "textarea"
    },
    {
      id: "q3",
      label: `La maladie actuelle est une punition. Id\xE9es d\xE9lirantes de culpabilit\xE9.`,
      type: "textarea"
    },
    {
      id: "q4",
      label: `Entend des voix qui l\u2019accusent ou la d\xE9noncent et/ou a des hallucinations visuelles`,
      type: "textarea"
    },
    {
      id: "q0",
      label: `N\u2019a pas d\u2019id\xE9e suicidaire`,
      type: "textarea"
    },
    {
      id: "q1",
      label: `A l\u2019impression que la vie ne vaut pas la peine d\u2019\xEAtre v\xE9cue`,
      type: "textarea"
    },
    {
      id: "q2",
      label: `Souhaite \xEAtre mort ou \xE9quivalent : toute pens\xE9e de mort possible dirig\xE9e contre lui-`,
      type: "textarea"
    },
    {
      id: "q3",
      label: `Id\xE9es ou geste de suicide`,
      type: "textarea"
    },
    {
      id: "q4",
      label: `Tentatives de suicide (coter toute tentative de suicide s\xE9rieuse)`,
      type: "textarea"
    },
    {
      id: "q0",
      label: `Pas de difficult\xE9 \xE0 s\u2019endormir`,
      type: "textarea"
    },
    {
      id: "q1",
      label: `Se plaint de difficult\xE9s \xE9ventuelles \xE0 s'endormir`,
      type: "textarea"
    },
    {
      id: "q2",
      label: `Se plaint d'avoir chaque soir des difficult\xE9s \xE0 s'endormir`,
      type: "textarea"
    },
    {
      id: "q0",
      label: `Pas de difficult\xE9`,
      type: "textarea"
    },
    {
      id: "q1",
      label: `Se plaint d'\xEAtre agit\xE9 ou troubl\xE9 pendant la nuit`,
      type: "textarea"
    },
    {
      id: "q2",
      label: `Se r\xE9veille pendant la nuit (coter toutes les fois o\xF9 le patient se l\xE8ve la nuit sauf si`,
      type: "textarea"
    },
    {
      id: "q0",
      label: `Pas de difficult\xE9`,
      type: "textarea"
    },
    {
      id: "q1",
      label: `Se r\xE9veille de tr\xE8s bonne heure mais se rendort`,
      type: "textarea"
    },
    {
      id: "q2",
      label: `Incapable de se rendormir s'il se l\xE8ve`,
      type: "textarea"
    },
    {
      id: "q0",
      label: `Pas de difficult\xE9`,
      type: "textarea"
    },
    {
      id: "q1",
      label: `Pens\xE9es et sentiments d\u2019incapacit\xE9, fatigue ou faiblesse se rapportant \xE0 des activit\xE9s`,
      type: "textarea"
    },
    {
      id: "q2",
      label: `Perte d'int\xE9r\xEAt pour les activit\xE9s professionnelles ou de d\xE9tente, soit d\xE9crite`,
      type: "textarea"
    },
    {
      id: "q3",
      label: `Diminution du temps d'activit\xE9 ou diminution de la productivit\xE9`,
      type: "textarea"
    },
    {
      id: "q4",
      label: `A arr\xEAt\xE9 son travail en raison de sa maladie actuelle.`,
      type: "textarea"
    },
    {
      id: "q0",
      label: `Pens\xE9e et langage normaux`,
      type: "textarea"
    },
    {
      id: "q1",
      label: `L\xE9ger ralentissement \xE0 l'entretien`,
      type: "textarea"
    },
    {
      id: "q2",
      label: `Ralentissement manifeste lors de l'entretien`,
      type: "textarea"
    },
    {
      id: "q3",
      label: `Entretien difficile`,
      type: "textarea"
    },
    {
      id: "q4",
      label: `Entretien impossible (\xE9tat de stupeur)`,
      type: "textarea"
    },
    {
      id: "q0",
      label: `Aucune`,
      type: "textarea"
    },
    {
      id: "q1",
      label: `Crispations, secousses musculaires`,
      type: "textarea"
    },
    {
      id: "q2",
      label: `Joue avec ses mains, ses cheveux...`,
      type: "textarea"
    },
    {
      id: "q3",
      label: `Bouge, ne peut rester assis tranquille`,
      type: "textarea"
    },
    {
      id: "q4",
      label: `Se tord les mains, se ronge les ongles, s\u2019arrache les cheveux, se mord les l\xE8vres`,
      type: "textarea"
    },
    {
      id: "q0",
      label: `Aucune`,
      type: "textarea"
    },
    {
      id: "q1",
      label: `Sympt\xF4mes l\xE9gers - Tension subjective et irritabilit\xE9`,
      type: "textarea"
    },
    {
      id: "q2",
      label: `Sympt\xF4mes mod\xE9r\xE9s - Se fait du souci \xE0 propos de probl\xE8mes mineurs`,
      type: "textarea"
    },
    {
      id: "q3",
      label: `Sympt\xF4mes s\xE9v\xE8res - Attitude inqui\xE8te, apparente dans l'expression faciale et le`,
      type: "textarea"
    },
    {
      id: "q4",
      label: `Sympt\xF4mes tr\xE8s invalidants - Peurs exprim\xE9es sans que l'on pose de questions`,
      type: "textarea"
    },
    {
      id: "q0",
      label: `Aucun de ces sympt\xF4mes`,
      type: "textarea"
    },
    {
      id: "q1",
      label: `Sympt\xF4mes l\xE9gers`,
      type: "textarea"
    },
    {
      id: "q2",
      label: `Sympt\xF4mes mod\xE9r\xE9s`,
      type: "textarea"
    },
    {
      id: "q3",
      label: `Sympt\xF4mes s\xE9v\xE8res`,
      type: "textarea"
    },
    {
      id: "q4",
      label: `Sympt\xF4mes tr\xE8s invalidants frappant le sujet d'incapacit\xE9 fonctionnelle`,
      type: "textarea"
    },
    {
      id: "q0",
      label: `Aucun sympt\xF4me`,
      type: "textarea"
    },
    {
      id: "q1",
      label: `Manque d\u2019app\xE9tit, mais mange sans y \xEAtre pouss\xE9`,
      type: "textarea"
    },
    {
      id: "q2",
      label: `A des difficult\xE9s \xE0 manger en l\u2019absence d\u2019incitations. Demande ou besoins de`,
      type: "textarea"
    },
    {
      id: "q0",
      label: `Aucun`,
      type: "textarea"
    },
    {
      id: "q1",
      label: `Lourdeur dans les membres, le dos et la t\xEAte. Maux de dos, de t\xEAte, douleurs`,
      type: "textarea"
    },
    {
      id: "q2",
      label: `Un des sympt\xF4mes appara\xEEt clairement`,
      type: "textarea"
    },
    {
      id: "q0",
      label: `Absents`,
      type: "textarea"
    },
    {
      id: "q1",
      label: `L\xE9gers`,
      type: "textarea"
    },
    {
      id: "q2",
      label: `S\xE9v\xE8res`,
      type: "textarea"
    },
    {
      id: "q0",
      label: `Absente`,
      type: "textarea"
    },
    {
      id: "q1",
      label: `Attention concentr\xE9e sur son propre corps`,
      type: "textarea"
    },
    {
      id: "q2",
      label: `Pr\xE9occupations sur sa sant\xE9`,
      type: "textarea"
    },
    {
      id: "q3",
      label: `Convaincu d\u2019\xEAtre malade. Plaintes fr\xE9quentes et demandes d'aide...`,
      type: "textarea"
    },
    {
      id: "q4",
      label: `Id\xE9es d\xE9lirantes hypochondriaques`,
      type: "textarea"
    },
    {
      id: "q0",
      label: `Pas de perte de poids`,
      type: "textarea"
    },
    {
      id: "q1",
      label: `Perte de poids probable`,
      type: "textarea"
    },
    {
      id: "q2",
      label: `Perte de poids certaine`,
      type: "textarea"
    },
    {
      id: "q0",
      label: `Perte inf\xE9rieure \xE0 500g par semaine`,
      type: "textarea"
    },
    {
      id: "q1",
      label: `Perte sup\xE9rieure \xE0 500g par semaine`,
      type: "textarea"
    },
    {
      id: "q2",
      label: `Perte sup\xE9rieure \xE0 1 kg par semaine`,
      type: "textarea"
    },
    {
      id: "q0",
      label: `Reconna\xEEt \xEAtre d\xE9prim\xE9e et malade`,
      type: "textarea"
    },
    {
      id: "q1",
      label: `Reconna\xEEt \xEAtre malade mais l\u2019attribue \xE0 la nourriture, au climat, au surmenage, \xE0`,
      type: "textarea"
    },
    {
      id: "q2",
      label: `Nie \xEAtre malade`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/neuro-psychologie/hit-de-patients-migraineux-def-pro.ts
var hit_de_patients_migraineux_def_pro = {
  metadata: {
    id: "hit-de-patients-migraineux-def-pro",
    title: `Questionnaire HIT de patients migraineux`,
    category: "neuro-psychologie"
  },
  questions: [
    {
      id: "q1",
      label: `Lorsque vous avez des maux de t\xEAte, la 6 8 10 11 13`,
      type: "textarea"
    },
    {
      id: "q2",
      label: `Votre capacit\xE9 \xE0 effectuer vos activit\xE9s 6 8 10 11 13`,
      type: "textarea"
    },
    {
      id: "q3",
      label: `Lorsque vous avez des maux de t\xEAte, 6 8 10 11 13`,
      type: "textarea"
    },
    {
      id: "q4",
      label: `Au cours de ces 4 derni\xE8res semaines, 6 8 10 11 13`,
      type: "textarea"
    },
    {
      id: "q5",
      label: `Au cours de ces 4 derni\xE8res semaines, 6 8 10 11 13`,
      type: "textarea"
    },
    {
      id: "q6",
      label: `Au cours de ces 4 derni\xE8res semaines, 6 8 10 11 13`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/neuro-psychologie/hypersensibilite-au-deficit-en-magnesium-def-pro.ts
var hypersensibilite_au_deficit_en_magnesium_def_pro = {
  metadata: {
    id: "hypersensibilite-au-deficit-en-magnesium-def-pro",
    title: `Questionnaire`,
    category: "neuro-psychologie"
  },
  questions: [
    {
      id: "q1",
      label: `Crampes, fourmillements`,
      type: "textarea"
    },
    {
      id: "q2",
      label: `Spasmes au niveau de la gorge (boule dans la gorge)`,
      type: "textarea"
    },
    {
      id: "q3",
      label: `Spasmes gastriques (crampes, a\xE9rophagie)`,
      type: "textarea"
    },
    {
      id: "q4",
      label: `Spasmes intestinaux (colites, ballonnements)`,
      type: "textarea"
    },
    {
      id: "q5",
      label: `Spasmes de l\u2019ut\xE9rus (douleurs pr\xE9menstruelles\u2026)`,
      type: "textarea"
    },
    {
      id: "q6",
      label: `Crispation des m\xE2choires`,
      type: "textarea"
    },
    {
      id: "q7",
      label: `Phosph\xE8nes ou acouph\xE8nes`,
      type: "textarea"
    },
    {
      id: "q8",
      label: `Douleurs musculaires et articulaires`,
      type: "textarea"
    },
    {
      id: "q9",
      label: `Asth\xE9nie paradoxale : fatigue matinale > fatigue du soir`,
      type: "textarea"
    },
    {
      id: "q10",
      label: `Tachycardie, extrasystoles, \xE9r\xE9thisme cardiaque`,
      type: "textarea"
    },
    {
      id: "q11",
      label: `Oppression respiratoire`,
      type: "textarea"
    },
    {
      id: "q12",
      label: `Troubles du sommeil`,
      type: "textarea"
    },
    {
      id: "q13",
      label: `Grande sensibilit\xE9 \xE0 l\u2019environnement, bruit, lumi\xE8re, personnes,`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/neuro-psychologie/idtas-ae-auto-eval-depression-trouble-affectif-saisonnier-def-pro.ts
var idtas_ae_auto_eval_depression_trouble_affectif_saisonnier_def_pro = {
  metadata: {
    id: "idtas-ae-auto-eval-depression-trouble-affectif-saisonnier-def-pro",
    title: `idtas ae auto eval depression trouble affectif saisonnier def pro`,
    category: "neuro-psychologie"
  },
  questions: [
    {
      id: "block-01",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Questionnaire  Auto-\xE9valuation IDTAS-AE  Inventaire symptomatique de la D\xE9pression et du Trouble Affectif Saisonnier  Ce questionnaire vous aidera \xE0 juger si vous devez consulter un clinicien pour votre d\xE9pression, si votre d\xE9pression est saisonni\xE8re et si un traitement doit \xEAtre envisag\xE9- que ce soit la luminoth\xE9rapie, un traitement m\xE9dicamenteux ou une psychoth\xE9rapie. Ceci n\u2019est pas une m\xE9thode d\u2019auto-diagnostic mais ce questionnaire peut vous aider \xE0 \xE9valuer la s\xE9v\xE9rit\xE9 et  l\u2019apparition de certains sympt\xF4mes de d\xE9pression. Nous vous recommandons de r\xE9pondre aux questions seul (e) \u2013 pour votre cas personnel- et de faire des copies pour les membres de votre famille ou les amis qui voudraient \xE9ventuellement utiliser ce questionnaire. Cochez vos r\xE9ponses \xE0 droite de chacune des questions et suivez les instructions pour \xE9tablir votre score.  PARTIE 1 : QUELQUES QUESTIONS \xC0 PROPOS DE LA D\xC9PRESSION  Au cours de la derni\xE8re ann\xE9e, avez-vous eu une p\xE9riode d\u2019une dur\xE9e d\u2019au moins deux  semaines durant laquelle vous avez pr\xE9sent\xE9 l\u2019un des probl\xE8mes suivants, et ce presque  tous les jours ? (Bien s\xFBr, vous auriez pu avoir plusieurs p\xE9riodes similaires).  Durant deux semaines ou plus\u2026   OUI   NON  Avez - vous eu des difficult\xE9s \xE0 vous   endormir, \xE0 rester  endormi ou encore \xE0 trop dormir ?  Vous \xEAtes-vous senti fatigu\xE9 ou avec peu d\u2019\xE9nergie ?  Avez-vous eu une diminution ou une augmentation d\u2019app\xE9tit  ?  Ou avez-vous eu une perte ou une prise significative du  poids en l\u2019absence d\u2019un r\xE9gime ?  Avez-vous eu peu d\u2019int\xE9r\xEAt ou de plaisir \xE0 faire vos activit\xE9s ?  Vous \xEAtes-vous senti triste, d\xE9prim\xE9 ou sans espoir ?  Vous \xEAtes-vous senti sans valeur, avec un sentiment d\u2019\xE9chec, d\u2019avoir l\u2019impression de vous laisser aller ou de d\xE9cevoir votre famille ?  Avez-vous des difficult\xE9s \xE0 vous concentrer, \xE0 lire le journal  ou \xE0 regarder la t\xE9l\xE9vision ?  Vous \xEAtes-vous senti agit\xE9 ou aviez-vous du mal \xE0 rester en place au point de bouger plus que normalement ? Ou au contraire, bougiez-vous ou parliez-vous tellement lentement que votre entourage l\u2019avait remarqu\xE9 ?  Avez-vous souvent pens\xE9 \xE0 la mort, qu\u2019il vaudrait mieux que  vous soyez mort ou pens\xE9 \xE0 vous faire du mal ?  A combien de questions avez-vous r\xE9pondu \xAB Oui \xBB`,
      type: "textarea"
    },
    {
      id: "block-02",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  PARTIE 2 : \xCATES-VOUS UNE PERSONNE QUI R\xC9AGIT AUX SAISONS?  Choisissez un seul \xE9nonc\xE9 qui d\xE9crit le mieux comment vos comportements et vos  \xE9motions changent selon les saisons.  (0= aucun changement, 1= l\xE9ger changement, 2= changement mod\xE9r\xE9, 3= changement  important, 4= changement extr\xEAme).  Enonc\xE9s...   0   1   2   3   4  Changement dans la dur\xE9e totale de votre sommeil (incluant les heures de sommeil  durant la nuit et les siestes)  Changement dans votre niveau d\u2019activit\xE9s sociales (incluant amis, famille et coll\xE8gues de travail)  Changement dans votre humeur ou votre sentiment de bien-\xEAtre  Changement de votre poids  Changement de votre app\xE9tit (autant les envies compulsives de nourriture que la  quantit\xE9 ing\xE9r\xE9e)  Changement de votre   niveau d\u2019\xE9nergie  Somme totale des nombres que vous avez coch\xE9s ci-dessus ?  PARTIE 3 : QUELS MOIS DE L\u2019ANN\xC9E VOUS APPARAISSENT LES PLUS  \xAB EXTR\xCAMES \xBB ?  Pour chacun des comportements ou des \xE9motions suivants, choisissez les mois qui  s\u2019appliquent. Si aucun mois ne s\u2019applique pour un item, ne choisissez \xAB aucun \xBB. Vous  devez choisir un mois seulement si vous reconnaissez un changement distinct en  comparaison avec les autres mois de l\u2019ann\xE9e et ce, survenant depuis plusieurs ann\xE9es.  Vous pouvez choisir plusieurs mois pour chaque item.  LISTE A  J\u2019ai tendance  \xE0 me sentir le  moins bien  Jan   Fev   Mar   Avr   Mai   Juin   Juil   Aout   Sept   Oct   Nov   Dec   Aucun  J\u2019ai tendance  \xE0 manger  davantage  Jan   Fev   Mar   Avr   Mai   Juin   Juil   Aout   Sept   Oct   Nov   Dec   Aucun  J\u2019ai tendance  \xE0 prendre le  plus de poids  Jan   Fev   Mar   Avr   Mai   Juin   Juil   Aout   Sept   Oct   Nov   Dec   Aucun  J\u2019ai tendance  \xE0 dormir  davantage  Jan   Fev   Mar   Avr   Mai   Juin   Juil   Aout   Sept   Oct   Nov   Dec   Aucun  J\u2019ai tendance  \xE0 avoir le  moins  d\u2019\xE9nergie  Jan   Fev   Mar   Avr   Mai   Juin   Juil   Aout   Sept   Oct   Nov   Dec   Aucun  J\u2019ai tendance  \xE0 avoir le plus  bas niveau  d\u2019activit\xE9s  sociales  Jan   Fev   Mar   Avr   Mai   Juin   Juil   Aout   Sept   Oct   Nov   Dec   Aucun`,
      type: "textarea"
    },
    {
      id: "block-03",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  LISTE B  J\u2019ai tendance  \xE0 me sentir  le mieux  Jan   Fev   Mar   Avr   Mai   Juin   Juil   Aout   Sept   Oct   Nov   Dec   Aucun  J\u2019ai tendance  \xE0 manger  le moins  Jan   Fev   Mar   Avr   Mai   Juin   Juil   Aout   Sept   Oct   Nov   Dec   Aucun  J\u2019ai tendance  \xE0 perdre  le plus de  poids  Jan   Fev   Mar   Avr   Mai   Juin   Juil   Aout   Sept   Oct   Nov   Dec   Aucun  J\u2019ai tendance  \xE0 dormir  le moins  Jan   Fev   Mar   Avr   Mai   Juin   Juil   Aout   Sept   Oct   Nov   Dec   Aucun  J\u2019ai tendance  \xE0 avoir le  plus  d\u2019\xE9nergie  Jan   Fev   Mar   Avr   Mai   Juin   Juil   Aout   Sept   Oct   Nov   Dec   Aucun  J\u2019ai tendance  \xE0 avoir  le plus haut  niveau  d\u2019activit\xE9s  sociales  Jan   Fev   Mar   Avr   Mai   Juin   Juil   Aout   Sept   Oct   Nov   Dec   Aucun  Dans les listes A et B ci-dessus, combien de fois avez-vous encercl\xE9 chacun des mois  suivants ?  Jan F\xE9v Mar Avr Mai Juin Juil Ao\xFBt Sept Oct Nov D\xE9c Aucun  Liste A  Liste B  PARTIE 4 : SYMPT\xD4MES POUVANT SURVENIR DURANT LES MOIS D\u2019HIVER\u2026  Comparativement \xE0 d\u2019autres p\xE9riodes de l\u2019ann\xE9e, durant les mois d\u2019hiver, le ou lesquels  des sympt\xF4mes suivants ont tendance \xE0 survenir durant les mois d\u2019hiver ? (S\u2019il n\u2019y en a  aucun, r\xE9pondre \xAB non \xBB.)  Durant les mois d\u2019hiver   OUI   NON  J\u2019 a i tendance \xE0 dormir plus longtemps (incluant les siestes).  J\u2019ai tendance \xE0 avoir plus de difficult\xE9s \xE0 me r\xE9veiller le  matin.  J\u2019ai tendance \xE0 avoir moins d\u2019\xE9nergie durant la journ\xE9e, \xE0 me  sentir fatigu\xE9 la plupart du temps.  J\u2019ai tendance en g\xE9n\xE9ral \xE0 me sentir plus mal en fin de soir\xE9e plut\xF4t qu\u2019en matin\xE9e.`,
      type: "textarea"
    },
    {
      id: "block-04",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  J\u2019ai tendance \xE0 avoir une baisse \xE9vidente mais temporaire de  l\u2019humeur ou de l\u2019\xE9nergie durant les apr\xE8s-midis.  J\u2019ai tendance \xE0 avoir des envies compulsives de sucreries ou de f\xE9culents.  J\u2019ai tendance \xE0 manger davantage de sucreries ou de  f\xE9culents que j\u2019en aie fortement envie ou pas.  J\u2019ai tendance \xE0 avoir des envies compulsives de sucreries  surtout en apr\xE8s-midi et en soir\xE9e.  J\u2019ai tendance \xE0 prendre plus de poids que durant l\u2019\xE9t\xE9.  A combien de questions avez - vous r\xE9pondu \xAB   oui   \xBB   ?  Grille de lecture et d\u2019interpr\xE9tation pour le professionnel de sant\xE9  D\u2019apr\xE8s Michael Terman, PhD, et Janet B.W. Williams, DSW Institut Psychiatrique de l\u2019\xC9tat de New York et D\xE9partement de Psychiatrie de l\u2019Universit\xE9 Columbia  (La Partie 1 a \xE9t\xE9 adapt\xE9e de Prime-MD Clinician Evaluation Guide, d\xE9velopp\xE9e par Robert L. Spitzer, MD, et Janet B.W. Williams, DSW de l\u2019institut Psychiatrique de New York et du D\xE9partement de Psychiatrie de l\u2019Universit\xE9 Columbia. Les Parties 2 et 3 ont \xE9t\xE9 adapt\xE9es de Seasonal Pattern Assessment Questionnaire, d\xE9velopp\xE9 par Norman E. Rosenthal, MD, Gary J. Bradt, et Thomas A. Wehr, MD du National Institute of Mental Health. La pr\xE9paration de l\u2019IDTAS a \xE9t\xE9 financ\xE9e en partie par la Subvention MH42930 du National Institute of Mental Health.)  Partie 1.  Si votre patient a encercl\xE9 plus de 5 probl\xE8mes :  \xAB   il est probable que vous ayez eu un trouble d\xE9pressif important pour lequel vous devriez chercher de l\u2019aide. M\xEAme si vous avez encercl\xE9 un ou deux probl\xE8mes, vous pourriez consulter un psychiatre, un psychologue, un travailleur social ou un autre intervenant en sant\xE9 mentale, surtout si ces probl\xE8mes vous inqui\xE8tent ou interf\xE8rent dans vos activit\xE9s quotidiennes. Vous avez peut-\xEAtre \xE9prouv\xE9 certains de ces probl\xE8mes pendant moins de deux semaines- si c\u2019est le cas, votre probl\xE8me n\u2019est probablement pas un trouble d\xE9pressif \u201Cimportant\u201D (selon la d\xE9finition clinique) mais peut \xEAtre assez s\xE9rieux pour n\xE9cessiter une consultation aupr\xE8s d\u2019un th\xE9rapeute et \xE9ventuellement un traitement. \xBB  Pour savoir si le probl\xE8me en question est saisonnier, voir les parties 2 et 3 ci-dessous.  Partie 2.  Si le score total de votre patient est inf\xE9rieur \xE0 6 dans la partie 2 : le probl\xE8me n\u2019est pas saisonnier.  \xAB Vous ne souffrez probablement pas d\u2019un trouble affectif saisonnier (TAS). Cependant, si votre score dans la partie 1 est \xE9lev\xE9, il est toujours possible que vous ayez souffert d\u2019une d\xE9pression qui requiert l\u2019attention et les conseils d\u2019un professionnel en sant\xE9 mentale. \xBB  Si le score de la partie 2 se situe entre 7 et 11 :  \xAB Vous pourriez souffrir d\u2019une forme l\xE9g\xE8re du TAS, dans laquelle des changements saisonniers sont visibles et m\xEAme probablement assez g\xEAnants.  Si le score de votre patient d\xE9passe 11 : forte probabilit\xE9 d\u2019un trouble affectif saisonnier clinique (TAS)`,
      type: "textarea"
    },
    {
      id: "block-05",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  \xAB Il est fort possible que vous souffriez d\u2019un TAS cliniquement significatif. Mais vous devez d\xE9terminer quels mois sont les plus probl\xE9matiques en consultant la partie 3.  Partie 3.  Colonne A : si votre patient un score mensuel en automne et hiver > 4 : d\xE9pression hivernale  Les personnes qui souffrent de d\xE9pression en automne ou en hiver ont tendance \xE0 obtenir un score sup\xE9rieur \xE0 4 par mois durant 3 \xE0 5 mois, commen\xE7ant entre septembre et janvier, comme cela appara\xEEt dans la colonne A. Durant les autres mois, le score est r\xE9duit et tend vers 0. Dans la colonne B, ces m\xEAmes personnes obtiennent habituellement un score sup\xE9rieur \xE0 4 par mois durant 3 \xE0 5 mois, commen\xE7ant entre mars et juin. Certaines personnes suivent un mod\xE8le diff\xE9rent et obtiennent des scores diff\xE9rents entre les colonnes A et B autant en hiver qu\u2019en \xE9t\xE9.  Colonne B : si votre patient un score mensuel des mois de printemps et \xE9t\xE9 > 4 : d\xE9pression saisonni\xE8re invers\xE9e  Partie 4 .  Si vous mentionnez un de ces comportements particuliers, vous avez \xE9prouv\xE9 des sympt\xF4mes hivernaux qui peuvent \xEAtre soulag\xE9s par les traitements utilis\xE9s pour le TAS, que vous ayez \xE9t\xE9 d\xE9prim\xE9(e) ou non. Plus vous obtenez un score \xE9lev\xE9 \xE0 la partie 4, plus vous \xEAtes sujet (te) \xE0 souffrir de d\xE9pression saisonni\xE8re. Cependant, il est possible d\u2019\xEAtre d\xE9prim\xE9 en hiver sans ces sympt\xF4mes- et m\xEAme avec des sympt\xF4mes contraires comme moins de sommeil et d\u2019app\xE9tit. Si c\u2019est le cas, un professionnel en sant\xE9 mentale pourrait vous recommander un traitement qui n\u2019est pas particuli\xE8rement con\xE7u pour les cas de d\xE9pression.`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/neuro-psychologie/madrs-echelle-de-depression-def-pro.ts
var madrs_echelle_de_depression_def_pro = {
  metadata: {
    id: "madrs-echelle-de-depression-def-pro",
    title: `madrs echelle de depression def pro`,
    category: "neuro-psychologie"
  },
  questions: [
    {
      id: "block-01",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Questionnaire  Echelle de d\xE9pression MADRS  Montgomery and Asberg Depression Scale  Question 1 : Tristesse apparente  Correspond au d\xE9couragement, \xE0 la d\xE9pression et au d\xE9sespoir (plus qu\u2019un  simple cafard passager) refl\xE9t\xE9s par la parole, la mimique et la posture. Coter  selon la profondeur et l\u2019incapacit\xE9 \xE0 se d\xE9rider.  Pas de tristesse.   0  Semble d\xE9courag\xE9 mais peut se d\xE9rider sans difficult\xE9.   2  Parait triste et malheureux la plupart du temps.   4  Semble malheureux tout le temps. Extr\xEAmement d\xE9courag\xE9.   6  Question 2 : Tristesse exprim\xE9e  Correspond \xE0 l\u2019expression d\u2019une humeur d\xE9pressive, que celle-ci soit apparente  ou non. Inclut le cafard, le d\xE9couragement ou le sentiment de d\xE9tresse sans  espoir. Coter selon l\u2019intensit\xE9, la dur\xE9e et le degr\xE9 auquel l\u2019humeur est dite \xEAtre  influenc\xE9e par les \xE9v\xE9nements.  Tristesse occasionnelle en rapport avec les circonstances.   0  Triste ou cafardeux, mais se d\xE9ride sans difficult\xE9.   2  Sentiment envahissant de tristesse ou de d\xE9pression.   4  Tristesse, d\xE9sespoir ou d\xE9couragement permanents ou sans fluctuation.   6  Question 3 : Tension int\xE9rieure  Correspond aux sentiments de malaise mal d\xE9fini, d\u2019irritabilit\xE9, d\u2019agitation  int\xE9rieure, de tension nerveuse allant jusqu\u2019\xE0 la panique, l\u2019effroi ou l\u2019angoisse.  Coter selon l\u2019intensit\xE9, la fr\xE9quence, la dur\xE9e, le degr\xE9 de r\xE9assurance  n\xE9cessaire.  Calme. Tension int\xE9rieure seulement passag\xE8re.   0  Sentiments occasionnels d\u2019irritabilit\xE9 et de malaise mal d\xE9fini.   2  Sentiments continuels de tension int\xE9rieure ou panique intermittente que le malade ne peut ma\xEEtriser qu\u2019avec difficult\xE9.  4  Effroi ou angoisse sans rel\xE2che. Panique envahissante.   6  Question 4 : R\xE9duction du sommeil  Correspond \xE0 une r\xE9duction de la dur\xE9e ou de la profondeur du sommeil par  comparaison avec le sommeil du patient lorsqu\u2019il n\u2019est pas malade.  Dort comme d\u2019habitude.   0`,
      type: "textarea"
    },
    {
      id: "block-02",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  L\xE9g\xE8re   difficult\xE9 \xE0 s\u2019endormir ou sommeil l\xE9g\xE8rement r\xE9duit. L\xE9ger ou agit\xE9.   2  Sommeil r\xE9duit ou interrompu au moins deux heures.   4  Moins de deux ou trois heures de sommeil.   6  Question 5 : R\xE9duction de l\u2019app\xE9tit  Correspond au sentiment   d\u2019une perte de l\u2019app\xE9tit compar\xE9 \xE0 l\u2019app\xE9tit habituel.  Coter l\u2019absence de d\xE9sir de nourriture ou le besoin de se forcer pour manger.  App\xE9tit normal ou augment\xE9.   0  App\xE9tit l\xE9g\xE8rement r\xE9duit.   2  Pas d\u2019app\xE9tit. Nourriture sans go\xFBt.   4  Ne   mange que si on le persuade.   6  Question 6 : Difficult\xE9s de concentration  Correspond aux difficult\xE9s \xE0 rassembler ses pens\xE9es allant jusqu\u2019\xE0 l\u2019incapacit\xE9 \xE0  se concentrer. Coter l\u2019intensit\xE9, la fr\xE9quence et le degr\xE9 d\u2019incapacit\xE9.  Pas de   difficult\xE9 de concentration.   0  Difficult\xE9s occasionnelles \xE0 rassembler ses pens\xE9es.   2  Difficult\xE9s \xE0 se concentrer et \xE0 maintenir son attention, ce qui r\xE9duit la capacit\xE9  \xE0 lire ou \xE0 soutenir une conversation.  4  Inc apacit\xE9 de lire ou de   converser   sans   grande difficult\xE9.   6  Question 7 : Lassitude  Correspond \xE0 une difficult\xE9 \xE0 se mettre en train ou une lenteur \xE0 commencer et  \xE0 accomplir les activit\xE9s quotidiennes.  Gu\xE8re de difficult\xE9s \xE0 se mettre en route ; pas de lenteur.   0  Difficult\xE9s \xE0 commencer des activit\xE9s.   2  Difficult\xE9s \xE0 commencer des activit\xE9s routini\xE8res qui sont poursuivies avec  effort.  4  Grande lassitude. Incapable de faire quoi que ce soit sans aide.   6  Question 8 :   Incapacit\xE9 \xE0 ressentir  Correspond \xE0 l\u2019exp\xE9rience subjective d\u2019une r\xE9duction d\u2019int\xE9r\xEAt pour le monde  environnant, ou les activit\xE9s qui donnent normalement du plaisir. La capacit\xE9 \xE0  r\xE9agir avec une \xE9motion appropri\xE9e aux circonstances ou aux gens est r\xE9duite.  Int\xE9r\xEAt normal pour le monde environnant et pour les gens.   0  Capacit\xE9 r\xE9duite \xE0 prendre plaisir \xE0 ses int\xE9r\xEAts habituels.   2  Perte d\u2019int\xE9r\xEAt pour le monde environnant. Perte de sentiment pour les amis et les connaissances.  4`,
      type: "textarea"
    },
    {
      id: "block-03",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Sentiment d\u2019\xEAtre paralys\xE9   \xE9motionnellement, incapacit\xE9 \xE0 ressentir de la  col\xE8re, du chagrin ou du plaisir, et impossibilit\xE9 compl\xE8te ou m\xEAme douloureuse de ressentir quelque chose pour les proches, parents et amis.  6  Question 9 :   Pens\xE9es pessimistes  Correspond aux id\xE9es de culpabilit\xE9, d\u2019inf\xE9riorit\xE9, d\u2019auto-accusation, de p\xE9ch\xE9  ou de ruine.  Pas de pens\xE9es pessimistes.   0  Id\xE9es intermittentes d\u2019\xE9chec, d\u2019auto-accusation et d\u2019autod\xE9pr\xE9ciation.   2  Auto-accusations persistantes ou id\xE9es de culpabilit\xE9 ou p\xE9ch\xE9 pr\xE9cises, mais encore rationnelles. Pessimisme croissant \xE0 propos du futur.  4  Id\xE9es d\xE9lirantes de ruine, de remords ou p\xE9ch\xE9 inexpiable. Auto-accusations absurdes et in\xE9branlables.  6  Question 10 : Id\xE9es de suicide  Correspond au sentiment que la vie ne vaut pas la peine d\u2019\xEAtre v\xE9cue, qu\u2019une  mort naturelle serait la bienvenue, id\xE9es de suicide et pr\xE9paratifs au suicide.  Les tentatives de suicide ne doivent pas, en elles-m\xEAmes, influencer la cotation.  Jouit de la vie ou la prend comme elle vient.   0  Fatigu\xE9 de la vie, id\xE9es de suicide seulement passag\xE8res.   2  Il vaudrait mieux \xEAtre mort. Les id\xE9es de suicide sont courantes et le suicide est consid\xE9r\xE9 comme une solution possible, mais sans projet ou intention pr\xE9cis.  4  Projets explicites de suicide si l\u2019occasion se pr\xE9sente. Pr\xE9paratifs de suicide.   6  Commentaire pour le professionnel de sant\xE9 et de soins : "Pro"  Le Montgomery-\xC5sberg Depression Rating Scale (MADRS) est une \xE9chelle d\u2019\xE9valuation de la s\xE9v\xE9rit\xE9 de la d\xE9pression. Elle peut \xE9galement \xEAtre utilis\xE9e dans le suivi pour mesurer l\u2019impact des traitements.  Son int\xE9r\xEAt r\xE9side dans une \xE9valuation de nombreux sympt\xF4mes vari\xE9s tels que le sommeil, l\u2019humeur, l\u2019app\xE9tit, les fatigues physiques et psychiques, les pens\xE9es dysfonctionnelles et suicidaires\u2026  L'\xE9chelle MADRS constitue un bon compl\xE9ment \xE0 l'\xE9chelle de d\xE9pression de Hamilton.  Interpr\xE9tation du score :  0 \xE0 6 : Pas de troubles d\xE9pressifs  8 \xE0 18 : D\xE9pression l\xE9g\xE8re  20 \xE0 35 : D\xE9pression moyenne  36 \xE0 60 : D\xE9pression s\xE9v\xE8re`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/neuro-psychologie/maladie-dalzheimer-def-pro.ts
var maladie_dalzheimer_def_pro = {
  metadata: {
    id: "maladie-dalzheimer-def-pro",
    title: `Questionnaire :`,
    category: "neuro-psychologie"
  },
  questions: [
    {
      id: "q1",
      label: `La personne a-t-elle des pertes de m\xE9moire ?`,
      type: "textarea"
    },
    {
      id: "q2",
      label: `Si oui, cette m\xE9moire est-elle moins bonne qu\u2019il y a quelques ann\xE9es ? La personne est`,
      type: "textarea"
    },
    {
      id: "q3",
      label: `La personne r\xE9p\xE8te-t-elle des questions, des d\xE9clarations ou des histoires dans la m\xEAme`,
      type: "textarea"
    },
    {
      id: "q4",
      label: `Avez-vous eu \xE0 prendre la rel\xE8ve de la personne pour suivre les \xE9v\xE9nements ou les`,
      type: "textarea"
    },
    {
      id: "q5",
      label: `La personne \xE9gare-t-elle des objets plus d\u2019une fois par mois ? Ou \xE9gare-t-elle des objets`,
      type: "textarea"
    },
    {
      id: "q6",
      label: `La personne soup\xE7onne-t-elle les autres de cacher ou voler des objets quand elle ne`,
      type: "textarea"
    },
    {
      id: "q7",
      label: `La personne a-t-elle souvent de la difficult\xE9 \xE0 conna\xEEtre le jour, la date, le mois,`,
      type: "textarea"
    },
    {
      id: "q8",
      label: `La personne est-elle d\xE9sorient\xE9e dans des lieux inconnus ?`,
      type: "textarea"
    },
    {
      id: "q9",
      label: `La personne devient-elle plus d\xE9sorient\xE9e \xE0 l\u2019ext\xE9rieur de la maison ou en voyage ?`,
      type: "textarea"
    },
    {
      id: "q10",
      label: `En excluant des limites physiques (par exemple, des tremblements\u2026), la personne a-t-`,
      type: "textarea"
    },
    {
      id: "q11",
      label: `En excluant des limites physiques, la personne a-t-elle de la difficult\xE9 \xE0 payer les`,
      type: "textarea"
    },
    {
      id: "q12",
      label: `La personne a-t-elle de la difficult\xE9 \xE0 se souvenir de prendre des m\xE9dicaments ou \xE0 se`,
      type: "textarea"
    },
    {
      id: "q13",
      label: `La personne a-t-elle de la difficult\xE9 \xE0 conduire ? OU \xEAtes-vous pr\xE9occup\xE9 par sa`,
      type: "textarea"
    },
    {
      id: "q14",
      label: `La personne a-t-elle des difficult\xE9s \xE0 utiliser les appareils (par exemple, micro-ondes,`,
      type: "textarea"
    },
    {
      id: "q15",
      label: `En excluant des limites physiques, la personne a-t-elle des difficult\xE9s \xE0 terminer des`,
      type: "textarea"
    },
    {
      id: "q16",
      label: `En excluant des limites physiques, la personne a-t-elle abandonn\xE9 ou diminu\xE9`,
      type: "textarea"
    },
    {
      id: "q17",
      label: `Est-ce que la personne se perd dans un environnement familier (son propre voisinage) ?`,
      type: "textarea"
    },
    {
      id: "q18",
      label: `La personne a-t-elle un sens diminu\xE9 de l\u2019orientation`,
      type: "textarea"
    },
    {
      id: "q19",
      label: `La personne a-t-elle de la difficult\xE9 \xE0 trouver des mots autres que les noms ?`,
      type: "textarea"
    },
    {
      id: "q20",
      label: `La personne a-t-elle une confusion sur les noms de membres de la famille ou d'amis ?`,
      type: "textarea"
    },
    {
      id: "q21",
      label: `La personne a-t-elle de la difficult\xE9 \xE0 reconna\xEEtre des personnes famili\xE8res ?`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/neuro-psychologie/mini-mental-state-examination-mmse-def-pro.ts
var mini_mental_state_examination_mmse_def_pro = {
  metadata: {
    id: "mini-mental-state-examination-mmse-def-pro",
    title: `Mini Mental State Examination (MMSE)`,
    category: "neuro-psychologie"
  },
  questions: [
    {
      id: "q1",
      label: `Quelle ann\xE9e sommes-nous ?`,
      type: "textarea"
    },
    {
      id: "q2",
      label: `En quelle saison ?`,
      type: "textarea"
    },
    {
      id: "q3",
      label: `En quel mois ?`,
      type: "textarea"
    },
    {
      id: "q4",
      label: `Quel jour du mois ?`,
      type: "textarea"
    },
    {
      id: "q5",
      label: `Quel jour de la semaine ?`,
      type: "textarea"
    },
    {
      id: "q6",
      label: `Quel est le nom de l\u2019h\xF4pital o\xF9 nous`,
      type: "textarea"
    },
    {
      id: "q7",
      label: `Dans quelle ville se trouve-t-il ?`,
      type: "textarea"
    },
    {
      id: "q8",
      label: `Quel est le nom du d\xE9partement dans`,
      type: "textarea"
    },
    {
      id: "q9",
      label: `Dans quelle province ou r\xE9gion est situ\xE9`,
      type: "textarea"
    },
    {
      id: "q10",
      label: `A quel \xE9tage sommes-nous ?`,
      type: "textarea"
    },
    {
      id: "q11",
      label: `Cigare Citron Fauteuil`,
      type: "textarea"
    },
    {
      id: "q12",
      label: `Fleur ou Cl\xE9 ou Tulipe`,
      type: "textarea"
    },
    {
      id: "q13",
      label: `Porte Ballon Canard`,
      type: "textarea"
    },
    {
      id: "q14",
      label: `93`,
      type: "textarea"
    },
    {
      id: "q15",
      label: `86`,
      type: "textarea"
    },
    {
      id: "q16",
      label: `79`,
      type: "textarea"
    },
    {
      id: "q17",
      label: `72`,
      type: "textarea"
    },
    {
      id: "q18",
      label: `65`,
      type: "textarea"
    },
    {
      id: "q19",
      label: `Cigare Citron Fauteuil`,
      type: "textarea"
    },
    {
      id: "q20",
      label: `Fleur ou Cl\xE9 ou Tulipe`,
      type: "textarea"
    },
    {
      id: "q21",
      label: `Porte Ballon Canard`,
      type: "textarea"
    },
    {
      id: "q22",
      label: `Quel est le nom de cet objet ?`,
      type: "textarea"
    },
    {
      id: "q23",
      label: `Quel est le nom de cet objet ?`,
      type: "textarea"
    },
    {
      id: "q24",
      label: `PAS DE MAIS, DE SI, NI DE ET`,
      type: "textarea"
    },
    {
      id: "q25",
      label: `Prenez cette feuille de papier avec votre`,
      type: "textarea"
    },
    {
      id: "q26",
      label: `Pliez-la en deux`,
      type: "textarea"
    },
    {
      id: "q27",
      label: `Et jetez-la par terre`,
      type: "textarea"
    },
    {
      id: "q28",
      label: `\xAB Faites ce qui est \xE9crit. \xBB`,
      type: "textarea"
    },
    {
      id: "q29",
      label: `\xAB Voulez-vous m\u2019\xE9crire une phrase, ce`,
      type: "textarea"
    },
    {
      id: "q30",
      label: `\xAB Voulez-vous recopier ce dessin. \xBB`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/neuro-psychologie/questionnaire-audit-alcool-def-pro.ts
var questionnaire_audit_alcool_def_pro = {
  metadata: {
    id: "questionnaire-audit-alcool-def-pro",
    title: `Questionnaire AUDIT :`,
    category: "neuro-psychologie"
  },
  questions: [
    {
      id: "q1",
      label: `A quelle fr\xE9quence vous arrive-t\u2010il de Au moins 2 \xE0 4x 2 \xE0 3x 4 x ou plus`,
      type: "textarea"
    },
    {
      id: "q2",
      label: `Combien de verres standards buvez-`,
      type: "textarea"
    },
    {
      id: "q3",
      label: `Au cours d'une m\xEAme occasion, Tous les`,
      type: "textarea"
    },
    {
      id: "q4",
      label: `Dans les 12 derniers mois, combien de Tous les`,
      type: "textarea"
    },
    {
      id: "q5",
      label: `Dans les 12 derniers mois, combien de Tous les`,
      type: "textarea"
    },
    {
      id: "q6",
      label: `Dans les 12 derniers mois, combien de Tous les`,
      type: "textarea"
    },
    {
      id: "q7",
      label: `Dans les 12 derniers mois, combien de Tous les`,
      type: "textarea"
    },
    {
      id: "q8",
      label: `Dans les 12 derniers mois, combien de Tous les`,
      type: "textarea"
    },
    {
      id: "q9",
      label: `Vous \xEAtes-vous bless\xE9 ou avez-vous Oui mais Oui au`,
      type: "textarea"
    },
    {
      id: "q10",
      label: `Est-ce qu\u2019un parent, un ami, un`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/neuro-psychologie/questionnaire-de-dependance-a-un-medicament-def-pro.ts
var questionnaire_de_dependance_a_un_medicament_def_pro = {
  metadata: {
    id: "questionnaire-de-dependance-a-un-medicament-def-pro",
    title: `questionnaire de dependance a un medicament def pro`,
    category: "neuro-psychologie"
  },
  questions: [
    {
      id: "block-01",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Questionnaire de d\xE9pendance \xE0 un m\xE9dicament  Crit\xE8res diagnostiques de d\xE9pendance (DSM-IV)  Cocher la ou les cases qui vous conviennent  Tol\xE9rance manifest\xE9e par le besoin d\u2019accro\xEEtre les doses consomm\xE9es pour obtenir l\u2019effet d\xE9sir\xE9 ou par une diminution des effets \xE0 dose consomm\xE9e constante  Sympt\xF4mes de sevrage \xE0 la suite d\u2019une p\xE9riode d\u2019abstinence, \xE9vit\xE9s ou am\xE9lior\xE9s par une nouvelle prise de m\xE9dicaments  Prise du m\xE9dicament en plus grande quantit\xE9 ou pendant plus longtemps que pr\xE9vu  Un d\xE9sir persistant ou des efforts infructueux pour diminuer ou contr\xF4ler la consommation  Beaucoup de temps pass\xE9 \xE0 utiliser ou \xE0 se procurer le m\xE9dicament  Abandonner ou r\xE9duire ses activit\xE9s sociales, professionnelles ou de loisir \xE0 cause de l\u2019usage du m\xE9dicament  Continuer \xE0 utiliser malgr\xE9 la connaissance des risques pour la sant\xE9  Commentaires destin\xE9s aux professionnels de sant\xE9 :  D\xE9pendance \xE0 une substance si 3 ou plus des crit\xE8res suivants sont pr\xE9sents  Sp\xE9cifier s\u2019il s\u2019agit d\u2019une d\xE9pendance physique (pr\xE9sence de l\u2019item 1 ou de l\u2019item 2)`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/neuro-psychologie/questionnaire-de-scoff-def-pro.ts
var questionnaire_de_scoff_def_pro = {
  metadata: {
    id: "questionnaire-de-scoff-def-pro",
    title: `Questionnaire :`,
    category: "neuro-psychologie"
  },
  questions: [
    {
      id: "q1",
      label: `Vous \xEAtes-vous d\xE9j\xE0 fait vomir parce que vous ne vous sentiez pas bien Cochez`,
      type: "textarea"
    },
    {
      id: "q2",
      label: `Craignez-vous d\u2019avoir perdu le contr\xF4le des quantit\xE9s que vous mangez ?`,
      type: "textarea"
    },
    {
      id: "q3",
      label: `Avez-vous perdu plus de 6 kilos en moins de trois mois ?`,
      type: "textarea"
    },
    {
      id: "q4",
      label: `Pensez-vous que vous \xEAtes trop gros(se) alors que les autres vous consid\xE8rent`,
      type: "textarea"
    },
    {
      id: "q5",
      label: `Diriez-vous que la nourriture est quelque chose qui occupe une place`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/neuro-psychologie/questionnaire-dopamine-noradrenaline-serotonine-melatonine-def-my-et-pro.ts
var questionnaire_dopamine_noradrenaline_serotonine_melatonine_def_my_et_pro = {
  metadata: {
    id: "questionnaire-dopamine-noradrenaline-serotonine-melatonine-def-my-et-pro",
    title: `questionnaire dopamine noradrenaline serotonine melatonine def my et pro`,
    category: "neuro-psychologie"
  },
  questions: [
    {
      id: "block-01",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Signes \xE9vocateurs d\u2019insuffisance en Dopamine  Cotation : comptabilisez les points attribu\xE9s \xE0 chaque r\xE9ponse, cochez en fonction de l\u2019intensit\xE9 ressentie lors des sympt\xF4mes cit\xE9s ci-dessous (0 \xE0 4)  Je ressens   0   1   2   3   4  J\u2019ai des   difficult\xE9s \xE0 me lever le matin  J\u2019ai du mal \xE0 commencer une action  Je me sens moins cr\xE9atif, moins imaginatif que je ne l\u2019ai \xE9t\xE9  Je ressens de la fatigue avant m\xEAme de commencer \xE0 agir  Je porte moins d'int\xE9r\xEAt \xE0 mes loisirs, mes   activit\xE9s  J'ai moins de d\xE9sir sexuel et amoureux  Mon sommeil est agit\xE9 physiquement, je remue beaucoup  Je n\u2019ai plus tellement de nouveaux projets  J\u2019ai du mal \xE0 me concentrer, \xE0 suivre le fil de ma pens\xE9e  Je cherche   souvent mes mots  Score total`,
      type: "textarea"
    },
    {
      id: "block-02",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Signes \xE9vocateurs d\u2019insuffisance en Noradr\xE9naline  Cotation : comptabilisez les points attribu\xE9s \xE0 chaque r\xE9ponse, cochez en fonction de l\u2019intensit\xE9 ressentie lors des sympt\xF4mes cit\xE9s ci-dessous (0 \xE0 4)  Je ressens   0   1   2   3   4  J\u2019ai une mauvaise opinion de moi - m\xEAme  Je manque de confiance  J\u2019ai souvent le sentiment de ne pas \xEAtre \xE0 la hauteur  J\u2019ai besoin de sentir l\u2019approbation des autres  J\u2019ai besoin d\u2019\xEAtre aim\xE9, rassur\xE9  Je ne   pers\xE9v\xE8re pas, je suis vite d\xE9courag\xE9  Je me sens moralement fatigu\xE9  Je prends rarement plaisir \xE0 ce que je fais  Je ne suis pas digne d\u2019\xEAtre aim\xE9  Je me sens triste, sans joie, sans plaisir  Score total`,
      type: "textarea"
    },
    {
      id: "block-03",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Signes \xE9vocateurs d\u2019insuffisance en S\xE9rotonine  Cotation : comptabilisez les points attribu\xE9s \xE0 chaque r\xE9ponse, cochez en fonction de l\u2019intensit\xE9 ressentie lors des sympt\xF4mes cit\xE9s ci-dessous (0 \xE0 4)  Je ressens   0   1   2   3   4  Je suis irritable, impulsif, et vite en   col\xE8re  Je suis impatient, je ne supporte pas d\u2019attendre  Je ne supporte pas les contraintes  Je suis attir\xE9 vers le sucr\xE9, le chocolat en fin de journ\xE9e  Je me sens d\xE9pendant facilement, tabac, alcool, drogues,  sports...  J\u2019ai du mal \xE0 prendre du recul, \xE0 rester zen  J\u2019ai du mal \xE0 trouver le sommeil, \xE0 me rendormir la nuit  Je me sens vite vuln\xE9rable au stress, au bruit  Je suis susceptible, un rien m\u2019agace  Je change tr\xE8s vite d\u2019humeur  Score total`,
      type: "textarea"
    },
    {
      id: "block-04",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Signes \xE9vocateurs d\u2019insuffisance en M\xE9latonine  Cotation : comptabilisez les points attribu\xE9s \xE0 chaque r\xE9ponse, cochez en fonction de l\u2019intensit\xE9 ressentie lors des sympt\xF4mes cit\xE9s ci-dessous (0 \xE0 4)  Je ressens   0   1   2   3   4  Je me sens   marginal, exclus, mal \xE0 l\u2019aise dans un groupe  Je suis plut\xF4t discret et en retrait en soci\xE9t\xE9  J\u2019ai un sommeil \xAB   fragile   \xBB  J\u2019ai du mal \xE0 aller me coucher le soir  Je n\u2019aime pas partager de confidences, je suis discret, r\xE9serv\xE9  Je ne suis pas tr\xE8s conciliant ni adaptable  Mes rythmes de vie sont souvent irr\xE9guliers ou d\xE9cal\xE9s  J\u2019ai du mal \xE0 me mettre \xE0 la place des autres, \xE0 les  comprendre  J\u2019ai plut\xF4t du mal \xE0 m\u2019exprimer, \xE0 partager  Je supporte mal les d\xE9calages horaires  Score total`,
      type: "textarea"
    },
    {
      id: "block-05",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  REMPLIR SELON  0 : non, jamais  1 : cela arrive parfois mais rarement  2 : r\xE9guli\xE8rement mais cela ne dure pas  3 : fr\xE9quemment et cela me g\xEAne  4 : oui, c'est invalidant dans ma vie   quotidiennement  SCORE  0 \xE0   10 : peu de signes cliniques \xE9vocateurs  10 \xE0 19 : perturbations, probable dysfonction  Plus de 20 : fortement perturb\xE9, \xE9vocateur de dysfonction  Commentaires pour vous aider \xE0 conseiller le patient : \xAB My \xBB  Les neurotransmetteurs sont des messagers chimiques intervenant dans la r\xE9gulation de nombreuses fonctions telles que l\u2019humeur, la pens\xE9e, la m\xE9moire, le sommeil, le comportement\u2026 leur \xE9quilibre est un \xE9l\xE9ment important dans la sant\xE9 mentale et le bien- \xEAtre. Ce questionnaire permet de rep\xE9rer des troubles fonctionnels dans lesquels l\u2019\xE9quilibre des neurotransmetteurs est impliqu\xE9. Il permet d\u2019orienter de fa\xE7on personnelle vers des conseils th\xE9rapeutiques, des conseils nutritionnels et micronutritionnels ou de modes de vie adapt\xE9s.`,
      type: "textarea"
    },
    {
      id: "block-06",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Commentaire pour les professionnels de sant\xE9 et de soins :   \xAB Pro \xBB  Ce questionnaire \xE9value des signes cliniques en relation avec des troubles fonctionnels des principaux neurotransmetteurs impliqu\xE9s dans la r\xE9gulation cognitive, de l\u2019humeur, du sommeil, de l\u2019adaptation et des comportements. Il permet de rep\xE9rer des dysfonctions de certains axes de neurotransmetteurs.  Mais \xE9galement une vue d\u2019ensemble synth\xE9tique du bon \xE9quilibre de ces diff\xE9rents axes. La mise en \xE9vidence d\u2019une dysfonction permet une correction fonctionnelle plus pr\xE9cise par des th\xE9rapeutiques m\xE9dicamenteuses ou non m\xE9dicamenteuses, des conseils alimentaires et micronutritionnels ou des conseils de modes de vie adapt\xE9s.`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/neuro-psychologie/questionnaire-fonctionnel-dhyperexcitabilite-def-pro.ts
var questionnaire_fonctionnel_dhyperexcitabilite_def_pro = {
  metadata: {
    id: "questionnaire-fonctionnel-dhyperexcitabilite-def-pro",
    title: `questionnaire fonctionnel dhyperexcitabilite def pro`,
    category: "neuro-psychologie"
  },
  questions: [
    {
      id: "block-01",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Questionnaire :  Hyperexcitabilit\xE9  Que ressentez-vous et \xE0 quelle fr\xE9quence cela vous g\xEAne ?   0   1   2   3   4  J\u2019ai facilement des crampes  Mes paupi\xE8res tressautent  J\u2019ai des fourmillements aux extr\xE9mit\xE9s, autour des l\xE8vres  J\u2019ai souvent des serrements ou une boule au niveau de la gorge  J\u2019ai des spasmes gastriques, des crampes d\u2019estomac  J\u2019ai de l\u2019a\xE9rophagie, des \xE9ructations, du reflux  J\u2019ai des spasmes intestinaux, des coliques, des ballonnements  J\u2019ai des spasmes, des douleurs abdominales avant les r\xE8gles  Je ressens souvent une crispation de la m\xE2choire  J\u2019ai des acouph\xE8nes, des bruits dans les oreilles  J\u2019ai des douleurs musculaires diffuses autour des articulations,  des douleurs lombaires si je suis fatigu\xE9  Je ressens une fatigue plus importante le matin que le soir  J\u2019ai des palpitations cardiaques, des extrasystoles  Ma fr\xE9quence cardiaque est souvent \xE9lev\xE9e sans effort  Je ressens une sensation d\u2019oppression respiratoire  J\u2019ai des troubles du sommeil  J\u2019ai un sommeil l\xE9ger, je me r\xE9veille au moindre bruit  Je suis vite fatigu\xE9 et irritable, agac\xE9  J\u2019ai l\u2019impression d\u2019\xEAtre vite stress\xE9  J\u2019ai une grande sensibilit\xE9 aux bruits, les bruits m\u2019\xE9nervent et me fatiguent  J\u2019ai une grande sensibilit\xE9 \xE0 l\u2019environnement g\xE9n\xE9ral, notamment  vis-\xE0-vis de la lumi\xE8re, des changements climatiques, des ondes  \xE9lectromagn\xE9tiques ou appareils \xE9lectrom\xE9nagers  J\u2019ai la peau qui r\xE9agit, qui gratte ou picote tr\xE8s facilement  Ma peau marque facilement et r\xE9agit avec des rougeurs  J\u2019ai un terrain allergique (rhume des foins, conjonctivites, asthme\u2026)  Score par colonne  Score total`,
      type: "textarea"
    },
    {
      id: "block-02",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Commentaire pour le professionnel de sant\xE9 et de soins : " Pro"  Ce questionnaire est propos\xE9 pour le rep\xE9rage et l\u2019\xE9valuation des principaux sympt\xF4mes en lien avec une hyperexcitabilit\xE9.  Il n\u2019a pas fait l\u2019objet d\u2019\xE9valuation. Il peut cependant \xEAtre utilis\xE9 pour le rep\xE9rage des principaux sympt\xF4mes et leur \xE9volution dans le suivi du patient pour \xE9valuer l\u2019impact th\xE9rapeutique.  Cotation :  Le patient \xE9value l\u2019intensit\xE9 de la g\xEAne ressentie pour les diff\xE9rents sympt\xF4mes : la cotation se fait en 5 r\xE9ponses possibles allant de :  0= aucune g\xEAne/jamais  1= peu g\xEAnant/rarement,  2= g\xEAnant/occasionnelle,  3 = perturbant/fr\xE9quent,  4= tr\xE8s invalidant/tr\xE8s fr\xE9quent  Interpr\xE9tation :  Le score varie de 0 \xE0 96  En l\u2019absence d\u2019\xE9valuation consensuelle, il est \xE9tabli une lecture suivante :  0 \xE0 20 : Pas de syndrome d\u2019hyperexcitabilit\xE9  21 \xE0 40 : Tr\xE8s l\xE9ger syndrome d\u2019hyperexcitabilit\xE9 possible  41 \xE0 60 : Syndrome d\u2019hyperexcitabilit\xE9 mod\xE9r\xE9e  61 \xE0 80 : Syndrome d\u2019hyperexcitabilit\xE9 s\xE9v\xE8re  >81 : Syndrome d\u2019hyperexcitabilit\xE9 tr\xE8s s\xE9v\xE8re ou invalidant`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/neuro-psychologie/questionnaire-reperage-des-troubles-dementiels-def-pro.ts
var questionnaire_reperage_des_troubles_dementiels_def_pro = {
  metadata: {
    id: "questionnaire-reperage-des-troubles-dementiels-def-pro",
    title: `Questionnaire :`,
    category: "neuro-psychologie"
  },
  questions: [
    {
      id: "q1",
      label: `M\xE9moire et rappel`,
      type: "textarea"
    },
    {
      id: "q2",
      label: `Orientation`,
      type: "textarea"
    },
    {
      id: "q3",
      label: `Capacit\xE9s de prises de d\xE9cision et de r\xE9solution de probl\xE8mes`,
      type: "textarea"
    },
    {
      id: "q4",
      label: `Activit\xE9s \xE0 l'ext\xE9rieur de la maison`,
      type: "textarea"
    },
    {
      id: "q5",
      label: `Fonctionnement \xE0 la maison et activit\xE9s de loisirs`,
      type: "textarea"
    },
    {
      id: "q6",
      label: `Toilette et hygi\xE8ne personnelle`,
      type: "textarea"
    },
    {
      id: "q7",
      label: `Changements de comportement et de personnalit\xE9`,
      type: "textarea"
    },
    {
      id: "q8",
      label: `Langage et capacit\xE9s de communication`,
      type: "textarea"
    },
    {
      id: "q9",
      label: `Humeur`,
      type: "textarea"
    },
    {
      id: "q10",
      label: `Attention et concentration`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/neuro-psychologie/questionnaire-test-des-5-mots-def-pro.ts
var questionnaire_test_des_5_mots_def_pro = {
  metadata: {
    id: "questionnaire-test-des-5-mots-def-pro",
    title: `questionnaire test des 5 mots def pro`,
    category: "neuro-psychologie"
  },
  questions: [
    {
      id: "block-01",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  LE TEST DE 5 MOTS  Dubois B. L'\xE9preuve des cinq mots.  On lui pr\xE9sente une liste de 5 mots et on lui demande de les lire \xE0 haute voix et de les retenir. Ces 5 mots sont plac\xE9s dans 5 cat\xE9gories (les cat\xE9gories ne sont pas pr\xE9sent\xE9es).  Objet   Cat\xE9gorie / Indice (\xE0 masquer)  Rose   Fleur  El\xE9phant   Animal  Chemise   V\xEAtement  Abricot   Fruit  Violon   Instrument de musique  ETAPE D'APPRENTISSAGE (rappel imm\xE9diat)  Pr\xE9sentation de la liste  - Montrer la liste de 5 mots et dire :  "Lisez cette liste de mots \xE0 haute voix et essayer de les retenir.  Je vous les redemanderai tout \xE0 l'heure"  - Une fois la liste lue et toujours pr\xE9sent\xE9e au patient (les cat\xE9gories sont masqu\xE9es), lui dire :  "pouvez-vous me dire, tout en regardant la feuilles, le nom du fruit, du v\xEAtement, etc.. "  Contr\xF4le de l'encodage = score d'apprentissage  - Cacher la feuille et dire au patient  "pouvez-vous me dire la liste des mots que vous venez d'apprendre ?"  -   En cas d'oubli et seulement pour les mots oubli\xE9s, poser la question en donnant la cat\xE9gorie (indice) " Quel est le nom du fruit, du v\xEAtement, etc..."  -   Compter les bonnes r\xE9ponses (avec ou sans indice) = score d'apprentissage`,
      type: "textarea"
    },
    {
      id: "block-02",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Si le score est inf\xE9rieur \xE0 5, montrer \xE0 nouveau la liste de 5 mots et rappeler les cat\xE9gories et les mots oubli\xE9s  SI le score est \xE9gal \xE0 5, l'enregistrement des mots a \xE9t\xE9 effectif, on peut passer \xE0 l'\xE9preuve de m\xE9moire  ETAPE DE MEMOIRE (rappel diff\xE9r\xE9)  Activit\xE9 d'attention intercurrente  Son but est seulement de d\xE9tourner l'attention du sujet pendant 3 \xE0 5 minutes  Etude de la m\xE9morisation (rappel diff\xE9r\xE9)  - Demander au patient  "Pouvez-vous me redonner les 5 mots que vous avez appris tout \xE0 l'heure ?"  - Pour les mots oubli\xE9s, poser la question en donnant la cat\xE9gorie (indice)  "Quel est le nom du fruit, du v\xEAtement, etc..."  - Compter le nombre de bons mots rapport\xE9s : c'est le score de m\xE9moire  RESULTATS  C'est le total : score d'apprentissage + score de m\xE9moire qui doit \xEAtre \xE9gal \xE0 10  Il existe un trouble de la m\xE9moire d\xE8s qu'un mot a \xE9t\xE9 oubli\xE9.  L'indi\xE7age permet de diff\xE9rentier un trouble mn\xE9sique d'un trouble de l'attention li\xE9 \xE0 l'\xE2ge ou \xE0 l'anxi\xE9t\xE9, d\xE9pression, etc...  Dans une population, g\xE9n\xE9rale \xE2g\xE9e, les valeurs totales < 10 ont une sensibilit\xE9 de 63% et une sp\xE9cificit\xE9 de 91% avec une valeur pr\xE9dictive de 11,4`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/neuro-psychologie/questionnaire-the-work-addiction-risk-test-wart-def-pro.ts
var questionnaire_the_work_addiction_risk_test_wart_def_pro = {
  metadata: {
    id: "questionnaire-the-work-addiction-risk-test-wart-def-pro",
    title: `questionnaire the work addiction risk test wart def pro`,
    category: "neuro-psychologie"
  },
  questions: [
    {
      id: "block-01",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Questionnaire :  The Work Addiction Risk Test (WART)  Cochez chaque phrase de la mani\xE8re suivante :   Notez 1 :   Pas du tout vrai \u2013  Notez 2 :   Peu souvent vrai -   Notez 3 :   Souvent vrai -   Notez 4 :   Toujours vrai.  Questions   Pas du tout vrai  Peu souvent vrai  Souvent vrai  Toujours vrai  Je pr\xE9f\xE8re faire moi - m\xEAme la majorit\xE9 des  choses plut\xF4t que demander de l\u2019aide  Je deviens tr\xE8s impatient quand je dois  attendre quelqu\u2019un ou quand quelque chose prend beaucoup de temps  Je semble \xEAtre en course contre la montre  Je deviens irrit\xE9 quand on m\u2019interrompt alors que je suis en plein travail  Je reste toujours occup\xE9 et garde plusieurs activit\xE9s en cours  Je me retrouve en train de faire 2 ou 3 choses en m\xEAme temps, comme d\xE9jeuner, \xE9crire un m\xE9mo et parler au t\xE9l\xE9phone  Je m\u2019engage sur plus que je ne peux supporter  Je me sens coupable quand je ne travaille pas  Il est important que je vois les r\xE9sultats concrets de ce que je fais  Je suis plus int\xE9ress\xE9 par le r\xE9sultat final de mon travail que par le processus  Les choses semblent ne jamais bouger aussi rapidement ou se r\xE9aliser avec autant de rapidit\xE9 pour moi  Je perds mon calme quand les choses ne se d\xE9roulent pas comme je le souhaite ou ne donnent pas les r\xE9sultats qui me conviennent  Je me pose toujours la m\xEAme question, sans le r\xE9aliser et apr\xE8s avoir re\xE7u la r\xE9ponse  Je passe beaucoup de temps \xE0 pr\xE9parer mentalement et penser aux \xE9v\xE9nements futurs tout en ignorant le ici et le maintenant`,
      type: "textarea"
    },
    {
      id: "block-02",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  R\xE9sultats :  25 \xE0 54 : Pas d\u2019addiction au travail - l55 \xE0 69 : Addiction minime au travail - 70 \xE0 100 : Addiction \xE9lev\xE9e au travail  R\xE9f\xE9rence : inrs \u2013 R\xE9f\xE9rences en sant\xE9 au travail \u2013 N\xB0139  Je me retrouve toujours \xE0 travailler apr\xE8s  que mes coll\xE8gues aient tout arr\xEAt\xE9  Je m\u2019\xE9nerve quand les personnes ne  rejoignent pas mes standards de perfection  Je m\u2019\xE9nerve quand je suis dans des situations que je ne peux pas contr\xF4ler  Je tends \xE0 me mettre sous pression avec des \xE9ch\xE9anciers personnels lorsque je travaille  C\u2019est dur pour moi de me relaxer quand je ne travaille pas  Je passe beaucoup plus de temps \xE0 travailler qu\u2019avec des amis, dans des passe- temps ou des activit\xE9s de loisirs  Je me lance dans des projets pour prendre une avance avant de finaliser les \xE9tapes  Je me f\xE2che de moi-m\xEAme si je fais une petite erreur  Je mets plus d\u2019id\xE9es, de temps, d\u2019\xE9nergie dans mon travail que je ne m\u2019investis dans mes relations avec mon conjoint et ma famille  J\u2019oublie, ignore ou minimise d\u2019importantes occasions familiales comme les anniversaires, r\xE9unions, vacances  Je prends les d\xE9cisions importantes avant d\u2019avoir tous les faits et d\u2019avoir la chance d\u2019y penser de fa\xE7on approfondie`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/neuro-psychologie/test-echelle-had-def-my-et-pro.ts
var test_echelle_had_def_my_et_pro = {
  metadata: {
    id: "test-echelle-had-def-my-et-pro",
    title: `test echelle had def my et pro`,
    category: "neuro-psychologie"
  },
  questions: [
    {
      id: "block-01",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Questionnaire :  Echelle du retentissement \xE9motionnel HAD  SCORE A  Je me sens tendu(e) ou \xE9nerv\xE9(e)   Notez\u2026  points  La plupart du temps   3  Souvent   2  De temps en temps   1  Jamais   0  J\u2019ai une sensation de peur comme si quelque chose d\u2019horrible allait m\u2019arriver  Oui, tr\xE8s nettement   3  Oui, mais ce n\u2019est pas tr\xE8s grave   2  Un peu, mais cela ne m\u2019inqui\xE8te pas   1  Pas du tout   0  Je me fais du souci  Tr\xE8s souvent   3  Assez souvent   2  Occasionnellement   1  Tr\xE8s   Occasionnellement   0  Je peux rester tranquillement assis(e) \xE0 ne rien faire et me sentir d\xE9contract\xE9(e)  Oui, quoi qu\u2019il arrive   0  Oui, en g\xE9n\xE9ral   1  Rarement   2  Jamais   3  J\u2019\xE9prouve des sensations de peur et j\u2019ai l\u2019estomac nou\xE9  Jamais   0  Parfois   1  Assez souvent   2  Tr\xE8s souvent   3  J\u2019ai la bougeotte et n\u2019arrive pas \xE0 tenir en place  Oui, c\u2019est tout \xE0 fait le cas   3  Un peu   2  Pas tellement   1  Pas du tout   0  J\u2019\xE9prouve des sensations   soudaines   de panique  Vraiment tr\xE8s souvent   3  Assez souvent   2  Pas tr\xE8s souvent   1  Jamais   0  Total score A`,
      type: "textarea"
    },
    {
      id: "block-02",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  SCORE D  Je prends plaisir aux m\xEAmes choses qu\u2019autrefois   Notez\u2026  points  Oui, tout autant   0  Pas autant   1  Un peu seulement   2  Presque plus   3  Je ris facilement et vois le bon c\xF4t\xE9 des choses  Autant que   par le pass\xE9   0  Plus autant qu\u2019avant   1  Vraiment moins qu\u2019avant   2  Plus du tout   3  Je suis de bonne humeur  Jamais   3  Rarement   2  Assez souvent   1  La plupart du temps   0  J\u2019ai l\u2019impression de fonctionner au ralenti  Presque toujours   3  Tr\xE8s souvent   2  Parfois   1  Jamais   0  Je ne m\u2019int\xE9resse plus \xE0 mon apparence  Plus du tout   3  Je n\u2019y accorde pas autant d\u2019attention que je le devrais   2  Il se peut que je n\u2019y fasse plus autant attention   1  J\u2019y pr\xEAte autant d\u2019attention que par le pass\xE9   0  Je me r\xE9jouis d\u2019avance \xE0 l\u2019id\xE9e de faire certaines choses  Autant qu\u2019auparavant   0  Un peu moins qu\u2019avant   1  Bien moins qu\u2019avant   2  Presque jamais   3  Je peux prendre plaisir \xE0 un bon livre ou \xE0 une bonne \xE9mission radio ou t\xE9l\xE9vision  Souvent   0  Parfois   1  Rarement   2  Tr\xE8s rarement   3  Total score D`,
      type: "textarea"
    },
    {
      id: "block-03",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Introduction patient   :  Le questionnaire suivant s\u2019int\xE9resse \xE0 vos \xE9tats d\u2019humeur et permet de rep\xE9rer des troubles tels que des troubles anxieux ou des troubles d\xE9pressifs. Pour y r\xE9pondre, soyez spontan\xE9s en consid\xE9rant vos \xE9tats d\u2019humeur au cours de ces derni\xE8res semaines. R\xE9pondez aux 14 questions suivantes en cochant la r\xE9ponse qui vous correspond le plus.  Scores  Additionnez les points des r\xE9ponses : 1, 3, 5, 7, 9, 11, 13 : Total A = _______  Additionnez les points des r\xE9ponses : 2, 4, 6, 8, 10, 12, 14 : Total D = _______  Interpr\xE9tation  Pour d\xE9pister des symptomatologies anxieuses et d\xE9pressives, l\u2019interpr\xE9tation suivante peut \xEAtre propos\xE9e pour  Chacun des scores (A et D) :  \uF0A7   7 ou moins : absence de symptomatologie  \uF0A7   8 \xE0 10 : symptomatologie douteuse  \uF0A7   11 et plus : symptomatologie certaine  Commentaire pour vous aider \xE0 conseiller le patient : \xAB My \xBB  L\u2019\xE9chelle HAD est un instrument qui permet de d\xE9pister les troubles anxieux et d\xE9pressifs.  Commentaire pour les professionnels de sant\xE9 et de soins : \xAB Pro \xBB  L\u2019\xE9chelle HAD est un instrument qui permet de d\xE9pister les troubles anxieux et d\xE9pressifs. Elle comporte 14 items cot\xE9s de 0 \xE0 3. Sept questions se rapportent \xE0 l\u2019anxi\xE9t\xE9 (total A) et sept autres \xE0 la dimension d\xE9pressive (total D), permettant ainsi l\u2019obtention de deux scores (note maximale de chaque score = 21).`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/neuro-psychologie/upps-impulsivite-def-pro.ts
var upps_impulsivite_def_pro = {
  metadata: {
    id: "upps-impulsivite-def-pro",
    title: `Questionnaire :`,
    category: "neuro-psychologie"
  },
  questions: [
    {
      id: "q1",
      label: `J'ai une attitude r\xE9serv\xE9e et prudente 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q2",
      label: `J'ai des difficult\xE9s \xE0 contr\xF4ler mes impulsion 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q3",
      label: `Je recherche g\xE9n\xE9ralement des exp\xE9riences e 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q4",
      label: `Je pr\xE9f\xE8re g\xE9n\xE9ralement mener les choses jus 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q5",
      label: `Ma mani\xE8re de penser est d'habitude 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q6",
      label: `J'ai des difficult\xE9s \xE0 r\xE9sister \xE0 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q7",
      label: `J'essayerais tout. 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q8",
      label: `J'ai tendance \xE0 abandonner facilement. ? 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q9",
      label: `Je ne suis pas de ces gens qui parlent sans r\xE9f 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q10",
      label: `Je m'implique souvent dans des situations 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q11",
      label: `J'aime les sports et les jeux dans lesquels on 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q12",
      label: `Je n'aime vraiment pas les t\xE2ches inachev\xE9es 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q13",
      label: `Je pr\xE9f\xE8re m'interrompre 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q14",
      label: `Quand je ne me sens pas bien, je fais souven 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q15",
      label: `\xC7a me plairait de faire du ski nautique. 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q16",
      label: `Une fois que je commence quelque chose je 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q17",
      label: `Je n'aime pas commencer un 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q18",
      label: `Parfois quand je ne me sens pas bien, je ne p 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q19",
      label: `J'\xE9prouve du plaisir \xE0 prendre des risques. 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q20",
      label: `Je me concentre facilement. 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q21",
      label: `J'aimerais faire du saut en parachute. 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q22",
      label: `J'ach\xE8ve ce que je commence. 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q23",
      label: `J'ai tendance \xE0 valoriser et \xE0 suivre une appr 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q24",
      label: `Quand je suis contrari\xE9(e), j'agis souvent 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q25",
      label: `Je me r\xE9jouis des 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q26",
      label: `Je m'organise de fa\xE7on \xE0 ce que les choses 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q27",
      label: `D'habitude je me d\xE9cide apr\xE8s un 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q28",
      label: `Quand je me sens rejet\xE9(e), je dis souvent 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q29",
      label: `J'aimerais apprendre \xE0 conduire un avion. 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q30",
      label: `Je suis une personne productive 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q31",
      label: `Je suis une personne prudente. 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q32",
      label: `C'est difficile pour moi de 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q33",
      label: `J'aime parfois faire des choses 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q34",
      label: `Une fois que je commence un projet, je le ter 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q35",
      label: `Avant de m'impliquer dans une 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q36",
      label: `J'aggrave souvent les choses parce que 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q37",
      label: `J'aimerais ressentir la sensation de 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q38",
      label: `Il y a tant de petites t\xE2ches qui doivent \xEAtre f 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q39",
      label: `D'habitude je r\xE9fl\xE9chis soigneusement avant 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q40",
      label: `Avant de me d\xE9cider, je consid\xE8re 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q41",
      label: `Quand la discussion s'\xE9chauffe, je dis souven 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q42",
      label: `J'aimerais aller faire de la plong\xE9e sous-- 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q43",
      label: `Je suis toujours capable de 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q44",
      label: `J'aimerais conduire vite. 1 2 3 4`,
      type: "textarea"
    },
    {
      id: "q45",
      label: `Parfois je fais des choses 1 2 3 4`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/pediatrie/conners-enseignant-version2-courte.ts
var conners_enseignant_version2_courte = {
  metadata: {
    id: "conners-enseignant-version2-courte",
    title: `Questionnaire de Conners pour les enseignants CTRS-R:S`,
    category: "pediatrie"
  },
  questions: [
    {
      id: "q1",
      label: `Inattentif, facilement distrait 0 1 2 3`,
      type: "textarea"
    },
    {
      id: "q2",
      label: `Provoquant 0 1 2 3`,
      type: "textarea"
    },
    {
      id: "q3",
      label: `N\u2019arr\xEAte pas de bouger, gigote, se tortille 0 1 2 3`,
      type: "textarea"
    },
    {
      id: "q4",
      label: `Oublie ce qu\u2019il/elle a d\xE9j\xE0 appris 0 1 2 3`,
      type: "textarea"
    },
    {
      id: "q5",
      label: `D\xE9range les autres enfants 0 1 2 3`,
      type: "textarea"
    },
    {
      id: "q6",
      label: `S\u2019oppose activement ou refuse de se conformer aux demandes de l\u2019adulte 0 1 2 3`,
      type: "textarea"
    },
    {
      id: "q7",
      label: `Toujours en mouvement, agit comme s\u2019il \xE9tait propuls\xE9 par un moteur 0 1 2 3`,
      type: "textarea"
    },
    {
      id: "q8",
      label: `Faible en orthographe 0 1 2 3`,
      type: "textarea"
    },
    {
      id: "q9",
      label: `Incapable de rester immobile 0 1 2 3`,
      type: "textarea"
    },
    {
      id: "q10",
      label: `Rancunier ou vindicatif 0 1 2 3`,
      type: "textarea"
    },
    {
      id: "q11",
      label: `Quitte son si\xE8ge dans la classe ou dans d\u2019autres situations o\xF9 il devrait rester 0 1 2 3`,
      type: "textarea"
    },
    {
      id: "q12",
      label: `Gigote des mains et des pieds ou se tortille sur son si\xE8ge 0 1 2 3`,
      type: "textarea"
    },
    {
      id: "q13",
      label: `Ne lit pas aussi bien que la moyenne des enfants de sa classe 0 1 2 3`,
      type: "textarea"
    },
    {
      id: "q14",
      label: `Courte capacit\xE9 d\u2019attention 0 1 2 3`,
      type: "textarea"
    },
    {
      id: "q15",
      label: `R\xE9plique, s\u2019obstine avec les adultes 0 1 2 3`,
      type: "textarea"
    },
    {
      id: "q16",
      label: `Porte attention seulement \xE0 ce qui l\u2019int\xE9resse vraiment 0 1 2 3`,
      type: "textarea"
    },
    {
      id: "q17",
      label: `A de la difficult\xE9 \xE0 attendre son tour 0 1 2 3`,
      type: "textarea"
    },
    {
      id: "q18",
      label: `Manque d\u2019int\xE9r\xEAt pour le travail scolaire 0 1 2 3`,
      type: "textarea"
    },
    {
      id: "q19",
      label: `Distractivit\xE9 ou dur\xE9e d\u2019attention probl\xE9matique 0 1 2 3`,
      type: "textarea"
    },
    {
      id: "q20",
      label: `Crises de col\xE8re, comportement explosif, impr\xE9visible 0 1 2 3`,
      type: "textarea"
    },
    {
      id: "q21",
      label: `Court partout ou grimpe de fa\xE7on exc\xE8ssive dans des situations o\xF9 cela n\u2019est 0 1 2 3`,
      type: "textarea"
    },
    {
      id: "q22",
      label: `Faible en arithm\xE9tique 0 1 2 3`,
      type: "textarea"
    },
    {
      id: "q23",
      label: `Interrompt autrui ou s\u2019impose (i.e. fait irruption dans la conversation ou les 0 1 2 3`,
      type: "textarea"
    },
    {
      id: "q24",
      label: `A de la difficult\xE9 \xE0 jouer ou \xE0 s\u2019embarquer dans un loisir calmement 0 1 2 3`,
      type: "textarea"
    },
    {
      id: "q25",
      label: `N\u2019arrive pas \xE0 terminer ce qu\u2019il a commenc\xE9 0 1 2 3`,
      type: "textarea"
    },
    {
      id: "q26",
      label: `Ne suit pas les consignes jusqu\u2019au bout et n\u2019arrive pas \xE0 terminer ses devoirs`,
      type: "textarea"
    },
    {
      id: "q27",
      label: `Excitable, impulsif 0 1 2 3`,
      type: "textarea"
    },
    {
      id: "q28",
      label: `Agit\xE9, toujours en mouvement 0 1 2 3`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/pediatrie/echelle-de-conners-tdah-interpretation.ts
var echelle_de_conners_tdah_interpretation = {
  metadata: {
    id: "echelle-de-conners-tdah-interpretation",
    title: `Conners 3 Update`,
    category: "pediatrie"
  },
  questions: [
    {
      id: "q1",
      label: `Validity Scale It is recommended that clinical judgment be used in the`,
      type: "textarea"
    },
    {
      id: "q2",
      label: `T-Score Interpretation Note that these guidelines are approximations and should`,
      type: "textarea"
    },
    {
      id: "q3",
      label: `Defiance/Aggression`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/pediatrie/echelle-de-matinalite-vesperalite-pour-l-enfant-def-pro.ts
var echelle_de_matinalite_vesperalite_pour_l_enfant_def_pro = {
  metadata: {
    id: "echelle-de-matinalite-vesperalite-pour-l-enfant-def-pro",
    title: `Questionnaire :`,
    category: "pediatrie"
  },
  questions: [
    {
      id: "q1",
      label: `Imagine que l\u2019\xE9cole n\u2019existe plus. Tu n\u2019es pas oblig\xE9(e) de te lever`,
      type: "textarea"
    },
    {
      id: "q2",
      label: `Chaque jour pour toi, te lever le matin c\u2019est`,
      type: "textarea"
    },
    {
      id: "q3",
      label: `Si les cours de gymnastique avaient lieu \xE0 7h 00 du matin, comment`,
      type: "textarea"
    },
    {
      id: "q4",
      label: `Mauvaise nouvelle : tu as un contr\xF4le de deux heures ! Bonne`,
      type: "textarea"
    },
    {
      id: "q5",
      label: `A quel moment de la journ\xE9e as-tu le plus d\u2019\xE9nergie pour faire ce qui te`,
      type: "textarea"
    },
    {
      id: "q6",
      label: `Chouette ! Tes parents te laissent te coucher \xE0 l\u2019heure que tu veux.`,
      type: "textarea"
    },
    {
      id: "q7",
      label: `Comment tu sens-tu dans la demi-heure qui suit ton r\xE9veil ?`,
      type: "textarea"
    },
    {
      id: "q8",
      label: `A quel moment ton corps commence-t-il \xE0 te dire qu\u2019il faut aller se`,
      type: "textarea"
    },
    {
      id: "q9",
      label: `Imaginons que tu doives tu lever tous les matins \xE0 6h 00. \xC7\xE0 serait ?`,
      type: "textarea"
    },
    {
      id: "q10",
      label: `Lorsque tu te l\xE8ves le matin, combien de temps te faut-il pour te`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/pneumologie/questionnaire-bpco-def-pro.ts
var questionnaire_bpco_def_pro = {
  metadata: {
    id: "questionnaire-bpco-def-pro",
    title: `Questionnaire BPCO`,
    category: "pneumologie"
  },
  questions: [
    {
      id: "q1",
      label: `Je souffre de mon essoufflement`,
      type: "textarea"
    },
    {
      id: "q2",
      label: `Je me fais du souci pour mon \xE9tat`,
      type: "textarea"
    },
    {
      id: "q3",
      label: `Je me sens incompris(e) par mon`,
      type: "textarea"
    },
    {
      id: "q4",
      label: `Mon \xE9tat respiratoire m\u2019emp\xEAche de me`,
      type: "textarea"
    },
    {
      id: "q5",
      label: `Je suis somnolent(e) dans la journ\xE9e`,
      type: "textarea"
    },
    {
      id: "q6",
      label: `Je me sens incapable de r\xE9aliser mes`,
      type: "textarea"
    },
    {
      id: "q7",
      label: `Je me fatigue rapidement dans les`,
      type: "textarea"
    },
    {
      id: "q8",
      label: `Physiquement, je suis insatisfait(e) de ce`,
      type: "textarea"
    },
    {
      id: "q9",
      label: `Ma maladie respiratoire perturbe ma vie`,
      type: "textarea"
    },
    {
      id: "q10",
      label: `Je me sens triste`,
      type: "textarea"
    },
    {
      id: "q11",
      label: `Mon \xE9tat respiratoire limite ma vie`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/rhumatologie/first-def-pro.ts
var first_def_pro = {
  metadata: {
    id: "first-def-pro",
    title: `Questionnaire FiRST`,
    category: "rhumatologie"
  },
  questions: [
    {
      id: "q1",
      label: `Mes douleurs sont localis\xE9es partout dans tout mon corps`,
      type: "textarea"
    },
    {
      id: "q2",
      label: `Mes douleurs s\u2019accompagnent d\u2019une fatigue g\xE9n\xE9rale`,
      type: "textarea"
    },
    {
      id: "q3",
      label: `Mes douleurs sont comme des br\xFBlures, des d\xE9charges`,
      type: "textarea"
    },
    {
      id: "q4",
      label: `Mes douleurs s\u2019accompagnent d\u2019autres sensations anormales,`,
      type: "textarea"
    },
    {
      id: "q5",
      label: `Mes douleurs s\u2019accompagnent d\u2019autres probl\xE8mes de sant\xE9`,
      type: "textarea"
    },
    {
      id: "q6",
      label: `Mes douleurs ont un retentissement important dans ma vie, en`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/rhumatologie/mesure-de-limpact-de-la-fibromyalgie-def-pro.ts
var mesure_de_limpact_de_la_fibromyalgie_def_pro = {
  metadata: {
    id: "mesure-de-limpact-de-la-fibromyalgie-def-pro",
    title: `Questionnaire de mesure de l\u2019impact de la`,
    category: "rhumatologie"
  },
  questions: [
    {
      id: "q1",
      label: `Etes-vous capable de : Toujours La plupart De temps Jamais`,
      type: "textarea"
    },
    {
      id: "q2",
      label: `Combien de jours vous \xEAtes-vous senti(e) bien ?`,
      type: "textarea"
    },
    {
      id: "q3",
      label: `Combien de jours de travail avez-vous manqu\xE9 \xE0 cause de la fibromyalgie ?`,
      type: "textarea"
    },
    {
      id: "q4",
      label: `Les jours o\xF9 vous avez travaill\xE9, les douleurs ou d\u2019autres probl\xE8mes li\xE9s \xE0 votre fibromyalgie`,
      type: "textarea"
    },
    {
      id: "q5",
      label: `Avez-vous eu des douleurs ?`,
      type: "textarea"
    },
    {
      id: "q6",
      label: `Avez-vous \xE9t\xE9 fatigu\xE9(e) ?`,
      type: "textarea"
    },
    {
      id: "q7",
      label: `Comment vous \xEAtes-vous senti(e) au r\xE9veil ?`,
      type: "textarea"
    },
    {
      id: "q8",
      label: `Vous \xEAtes-vous senti(e) raide ?`,
      type: "textarea"
    },
    {
      id: "q9",
      label: `Vous \xEAtes-vous senti(e) tendu(e) ou inquiet(e) ?`,
      type: "textarea"
    },
    {
      id: "q10",
      label: `Vous \xEAtes-vous senti(e) d\xE9prim\xE9(e) ?`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/sommeil/echelle-de-somnolence-depsworth-my-et-pro-ok.ts
var echelle_de_somnolence_depsworth_my_et_pro_ok = {
  metadata: {
    id: "echelle-de-somnolence-depsworth-my-et-pro-ok",
    title: `Questionnaire`,
    category: "sommeil"
  },
  questions: [
    {
      id: "q1",
      label: `Pendant que vous \xEAtes occup\xE9 \xE0 lire un 0 1 2 3`,
      type: "textarea"
    },
    {
      id: "q2",
      label: `Devant la t\xE9l\xE9vision ou au cin\xE9ma 0 1 2 3`,
      type: "textarea"
    },
    {
      id: "q3",
      label: `Assis inactif dans un lieu public (salle 0 1 2 3`,
      type: "textarea"
    },
    {
      id: "q4",
      label: `Passager, depuis au moins une heure sans 0 1 2 3`,
      type: "textarea"
    },
    {
      id: "q5",
      label: `Allong\xE9 pour une sieste, lorsque les 0 1 2 3`,
      type: "textarea"
    },
    {
      id: "q6",
      label: `En position assise au cours d\u2019une 0 1 2 3`,
      type: "textarea"
    },
    {
      id: "q7",
      label: `Tranquillement assis \xE0 table \xE0 la fin d\u2019un 0 1 2 3`,
      type: "textarea"
    },
    {
      id: "q8",
      label: `Au volant d\u2019une voiture immobilis\xE9e 0 1 2 3`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/sommeil/echelle-multidimensionnelle-de-fatigue-pro-def.ts
var echelle_multidimensionnelle_de_fatigue_pro_def = {
  metadata: {
    id: "echelle-multidimensionnelle-de-fatigue-pro-def",
    title: `echelle multidimensionnelle de fatigue pro def`,
    category: "sommeil"
  },
  questions: [
    {
      id: "block-01",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Questionnaire :  Echelle multidimensionnelle de fatigue  Comment remplir ce questionnaire ?  Au moyen des \xE9nonc\xE9s suivants, nous aimerions comprendre comment vous vous sentiez r\xE9cemment.  R\xE9pondez \xE0 toutes les questions en encerclant le chiffre appropri\xE9 selon l\u2019\xE9chelle suivante : vous r\xE9pondrez 1 si vous n\u2019\xEAtes pas du tout d\u2019accord et, \xE0 l\u2019inverse vous r\xE9pondrez 5 si vous \xEAtes tout \xE0 fait d\u2019accord. Toutes les nuances entre 1 et 5 sont possibles.  Voici un exemple d\u2019\xE9nonc\xE9 : Je me sens repos\xE9(e). Si vous pensez que cet \xE9nonc\xE9 est enti\xE8rement vrai, c\u2019est-\xE0- dire que vous \xEAtes tout \xE0 fait d'accord avec celui-ci, encerclez le chiffre 5 \xE0 droite de l\u2019\xE9nonc\xE9.  Vos r\xE9ponses  1   Je me sens en   forme   1   2   3   4   5  2   Physiquement, je n\u2019ai pas la force de faire grand - chose   1   2   3   4   5  3   Je me sens tr\xE8s actif   1   2   3   4   5  4   J\u2019ai envie de faire plein de choses agr\xE9ables   1   2   3   4   5  5   Je me sens fatigu\xE9(e)   1   2   3   4   5  6   Je crois que j\u2019en fais   beaucoup dans une journ\xE9e   1   2   3   4   5  7   Je suis capable de me concentrer sur ce que j\u2019entreprends   1   2   3   4   5  8   J\u2019ai une bonne r\xE9sistance physique   1   2   3   4   5  9   Je suis stress\xE9(e) \xE0 l\u2019id\xE9e d\u2019avoir quelque chose \xE0 faire   1   2   3   4   5  10   Je crois que je fais tr\xE8s peu dans une journ\xE9e   1   2   3   4   5  11   J\u2019arrive facilement \xE0 me concentrer   1   2   3   4   5  12   Je me sens repos\xE9(e)   1   2   3   4   5  13   Il me faut beaucoup d\u2019efforts pour me concentrer   1   2   3   4   5  14   Physiquement, je me sens en mauvaise condition   1   2   3   4   5  15   J\u2019ai beaucoup de projets   1   2   3   4   5  16   Je me fatigue facilement   1   2   3   4   5  17   Je n\u2019ach\xE8ve que tr\xE8s peu de choses   1   2   3   4   5  18   J\u2019ai envie de ne rien faire   1   2   3   4   5  19   Je me laisse facilement distraire   1   2   3   4   5  20   Physiquement, je me sens en excellente forme   1   2   3   4   5`,
      type: "textarea"
    },
    {
      id: "block-02",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Mode de correction  Retranscrire les r\xE9ponses encercl\xE9es dans les cases vides (derni\xE8re colonne \xE0 droite) pour les items 1, 3, 4, 6, 7, 8, 11, 12, 15 et 20 (case de correction identifi\xE9e \xAB 6-r\xE9p \xBB), il faut inverser le score : calculer \xAB 6 \u2013 r\xE9ponse encercl\xE9e \xBB, et inscrire le r\xE9sultat dans la case. En bas de page, calculer les totaux des cinq sous-\xE9chelles en additionnant les chiffres inscrits dans les cases de correction.  Vous noterez donc la somme de calcul 6 \u2013 r\xE9ponse du patient = point obtenu \xE0 cette question  Exemple : question 1 (je me sens forme), votre patient a entour\xE9 la case \xAB 2 \xBB, vous devez porter le chiffre 4 dans la case r\xE9ponse ; en effet, 6 -2 = 4  Cotation :  \u2192   L\u2019instrument comporte cinq sous-\xE9chelles, chacune d\u2019entre-elles incluant quatre questions :  Fatigue g\xE9n\xE9rale (G\xE9n) ; Fatigue physique (Phy) ;   Fatigue mentale (Men) ; R\xE9duction des activit\xE9s (Act) ;   R\xE9duction de la motivati on (Mot).  \u2192   Au total, 10 des 20 items (items 1, 3, 4, 6, 7, 8, 11, 12, 15 et 20) doivent \xEAtre invers\xE9s (6 \u2013 r\xE9ponse  inscrite sur l\u2019\xE9chelle de 1 \xE0 5) ;  \u2192   Pour obtenir les scores totaux, il suffit d\u2019additionner les scores transform\xE9s des quatre items de  chacune des sous- \xE9chelles (minimum = 4 ; maximum = 20) ;  \u2192   La cl\xE9 de correction se trouve directement sur le questionnaire :  il faut retranscrire la r\xE9ponse telle quelle dans les cases vides ;  il faut inverser (6   \u2013 r\xE9ponse inscrite) dans les cases portant la mention \xAB 6-r\xE9p \xBB  Il n\u2019y a pas de bar\xE8me interpr\xE9tation mais il existe des seuils sugg\xE9rant la prestance de fatigue significative issue de la litt\xE9rature m\xE9dicale  Des scores seuils selon l\u2019\xE2ge et le sexe ont \xE9t\xE9 propos\xE9s pour la sous-\xE9chelle de fatigue g\xE9n\xE9rale  en fonction de donn\xE9es \xE9pid\xE9miologiques allemandes (Schwarz et al., 2003 ; Singer et al., 2011).  Ces scores correspondent au 25e percentile de la population allemande.  SCORES SEUILS SUGG\xC9RANT LA PR\xC9SENCE DE FATIGUE SIGNIFICATIVE  (pour la sous-\xE9chelle de fatigue g\xE9n\xE9rale seulement)  Sexe / \xE2ge   \u2264 39 ans   40-59 ans   \u2265 60 ans  Hommes   \u2265 9   \u2265 11   \u2265 14  Femmes   \u2265 11   \u2265 12   \u2265 1 4  Selon   l\u2019intensit\xE9   des   scores   et   le   type   de   fatigue,   une   prise   en   charge   nutritionnelle, micronutritionnelle   ou   un   changement   de   mode   de   vie   seront   mis   en   place   de   fa\xE7on personnalis\xE9e et individualis\xE9e`,
      type: "textarea"
    },
    {
      id: "block-03",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Grille de calcul de l\u2019\xE9chelle MFI  question  num\xE9ro  R\xE9ponse du patient   G\xE9n\xE9rale   Physique   Mentale   Activit\xE9   Motivation  1   1   2   3   4   5   6-r\xE9ponse  2  3   6-r\xE9ponse  4   6-r\xE9ponse  5  6   6-r\xE9ponse  7   6-r\xE9ponse  8   6-r\xE9ponse  9  10  11  12   6-r\xE9ponse  13  14  15   6-r\xE9ponse  16  17  18  19  20   6-r\xE9ponse  Totaux`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/sommeil/echelle-syndrome-des-jambes-sans-repos-irls-def-pro.ts
var echelle_syndrome_des_jambes_sans_repos_irls_def_pro = {
  metadata: {
    id: "echelle-syndrome-des-jambes-sans-repos-irls-def-pro",
    title: `Questionnaire`,
    category: "sommeil"
  },
  questions: [
    {
      id: "q1",
      label: `Comment \xE9valuez-vous l\u2019intensit\xE9 des d\xE9sagr\xE9ments de votre syndrome des`,
      type: "textarea"
    },
    {
      id: "q2",
      label: `Comment \xE9valuez-vous votre besoin de bouger \xE0 cause de votre syndrome`,
      type: "textarea"
    },
    {
      id: "q3",
      label: `Le d\xE9sagr\xE9ment dans vos jambes ou dans vos bras s\u2019am\xE9liore-t-il lorsque`,
      type: "textarea"
    },
    {
      id: "q4",
      label: `Votre sommeil est-il perturb\xE9 par votre syndrome des jambes sans repos ?`,
      type: "textarea"
    },
    {
      id: "q5",
      label: `Votre syndrome des jambes sans repos est-il responsable de fatigue ou de`,
      type: "textarea"
    },
    {
      id: "q6",
      label: `A quel niveau de s\xE9v\xE9rit\xE9 estimez-vous votre syndrome des jambes sans`,
      type: "textarea"
    },
    {
      id: "q7",
      label: `A quelle fr\xE9quence souffrez-vous de votre syndrome des jambes sans repos ?`,
      type: "textarea"
    },
    {
      id: "q8",
      label: `Combien de temps dure une crise de syndrome des jambes sans repos sur (1`,
      type: "textarea"
    },
    {
      id: "q9",
      label: `Quel est l\u2019impact de votre syndrome des jambes sans repos sur votre vie`,
      type: "textarea"
    },
    {
      id: "q10",
      label: `Quel est le retentissement de votre syndrome des jambes sans repos sur votre`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/sommeil/questionnaire-agenda-du-sommeil-def.ts
var questionnaire_agenda_du_sommeil_def = {
  metadata: {
    id: "questionnaire-agenda-du-sommeil-def",
    title: `questionnaire agenda du sommeil def`,
    category: "sommeil"
  },
  questions: [
    {
      id: "block-01",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Questionnaire :   Agenda du sommeil - \xE9veil  Jours   Hypnotique  (cocher)  19 h  20 h  21 h  22 h  23 h  00 h  1h   2h   3h   4h   5h   6h   7h   8h   9h   10 h  11 h  12 h  13 h  14 h  15 h  16 h  17 h  18 h  Qualit\xE9 du  sommeil  Qualit\xE9 de l\u2019\xE9veil   Remarques  Lun  Mar  Mer  Jeu  Ven  Sam  Dim  Lun  Mar  Mer  Jeu  Ven  Sam  Dim  Lun  Mar  Mer  Jeu  Ven  Sam  Dim`,
      type: "textarea"
    },
    {
      id: "block-02",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Mode d\u2019utilisation  Heure d\u2019extinction de la lumi\xE8re   O   Fatigue   Qualit\xE9 du sommeil : noter de 1 \xE0 10 dans la case  /// P\xE9riodes de sommeil   Envie de dormir   Qualit\xE9 de l\u2019\xE9veil : noter de 1 \xE0 10 dans la case  (__) P\xE9riodes d\u2019\xE9veil nocturne   Sieste involontaire   (\xE9tat dans la journ\xE9e, en forme ou non)  Heure du lever   Sieste volontaire   Traitement : en cas de prise d\u2019hypnotique : cocher la case  Consigne au patient :  Remplir l\u2019agenda :  \u2022   Chaque matin, en fonction des souvenirs de la nuit (inutile de regarder sa montre pendant la nuit, ce qui perturberait davantage le sommeil : l\u2019agenda n\u2019est pas un outil de pr\xE9cision)  \u2022   Chaque soir, pour relater l\u2019\xE9tat du patient pendant la journ\xE9e.  Tenir l\u2019agenda sur l\u2019ensemble de la p\xE9riode d\u2019observation des 21j ou 3 semaines, de fa\xE7on \xE0 obtenir un aper\xE7u des variations de sommeil au fil du temps.`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/sommeil/questionnaire-chronotype-de-horn-def-my-et-pro.ts
var questionnaire_chronotype_de_horn_def_my_et_pro = {
  metadata: {
    id: "questionnaire-chronotype-de-horn-def-my-et-pro",
    title: `Questionnaire :`,
    category: "sommeil"
  },
  questions: [
    {
      id: "q1",
      label: `Si vous \xE9tiez enti\xE8rement libre de planifier votre journ\xE9e, \xE0 quelle heure environ vous`,
      type: "textarea"
    },
    {
      id: "q2",
      label: `Si vous \xE9tiez enti\xE8rement libre de planifier votre soir\xE9e, \xE0 quelle heure environ`,
      type: "textarea"
    },
    {
      id: "q3",
      label: `Lorsque vous devez vous lever \xE0 une heure sp\xE9cifique le matin, \xE0 quel point`,
      type: "textarea"
    },
    {
      id: "q4",
      label: `Comment trouvez-vous le fait de vous lever le matin (quand vous n\u2019\xEAtes pas r\xE9veill\xE9(e)`,
      type: "textarea"
    },
    {
      id: "q5",
      label: `Comment vous sentez-vous durant la premi\xE8re demi-heure suivant votre r\xE9veil le matin?`,
      type: "textarea"
    },
    {
      id: "q6",
      label: `Comment est votre app\xE9tit durant la premi\xE8re demi-heure suivant votre r\xE9veil ?`,
      type: "textarea"
    },
    {
      id: "q7",
      label: `Durant la premi\xE8re demi-heure suivant votre r\xE9veil le matin, comment vous sentez-vous ?`,
      type: "textarea"
    },
    {
      id: "q8",
      label: `Lorsque vous n'avez aucun engagement le lendemain, \xE0 quelle heure vous couchez-vous par`,
      type: "textarea"
    },
    {
      id: "q9",
      label: `Vous avez d\xE9cid\xE9 de faire du sport 2 fois par semaine avec un(e) ami(e) qui est disponible`,
      type: "textarea"
    },
    {
      id: "q10",
      label: `Dans la soir\xE9e, \xE0 quelle heure environ vous sentez-vous fatigu\xE9 et \xE9prouvez-vous le besoin`,
      type: "textarea"
    },
    {
      id: "q11",
      label: `Vous voulez atteindre votre meilleure performance dans un test qui, vous le savez, sera`,
      type: "textarea"
    },
    {
      id: "q12",
      label: `Si vous allez vous coucher \xE0 23h00, \xE0 quel point vous sentirez-vous fatigu\xE9(e)?`,
      type: "textarea"
    },
    {
      id: "q13",
      label: `Si vous vous couchez quelques heures plus tard que d'habitude et que vous n'avez aucune`,
      type: "textarea"
    },
    {
      id: "q14",
      label: `Vous devez rester r\xE9veill\xE9(e) entre 4h00 et 6h00 du matin pour une garde de nuit et vous`,
      type: "textarea"
    },
    {
      id: "q15",
      label: `Vous devez faire 2 heures de travail physique intense et vous \xEAtes enti\xE8rement libre de`,
      type: "textarea"
    },
    {
      id: "q16",
      label: `Vous avez d\xE9cid\xE9 de faire du sport 2 fois par semaine avec un(e) ami(e) qui est disponible`,
      type: "textarea"
    },
    {
      id: "q17",
      label: `Supposons que vous puissiez choisir vos propres heures de travail, que vous travailliez`,
      type: "textarea"
    },
    {
      id: "q18",
      label: `\xC0 quelle heure environ vous sentez-vous dans votre meilleure forme ?`,
      type: "textarea"
    },
    {
      id: "q19",
      label: `On parle de gens "du matin" (ou "l\xE8ve-t\xF4t") et de gens "du soir" (ou "couche-tard").`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/sommeil/questionnaire-de-berlin-apnee-du-sommeil-def-pro.ts
var questionnaire_de_berlin_apnee_du_sommeil_def_pro = {
  metadata: {
    id: "questionnaire-de-berlin-apnee-du-sommeil-def-pro",
    title: `Questionnaire :`,
    category: "sommeil"
  },
  questions: [
    {
      id: "q1",
      label: `Est-ce que vous ronflez ?`,
      type: "textarea"
    },
    {
      id: "q2",
      label: `Votre ronglement est -il ?`,
      type: "textarea"
    },
    {
      id: "q3",
      label: `Combien de fois ronflez vous ?`,
      type: "textarea"
    },
    {
      id: "q4",
      label: `Votre ronflement a-t-il d\xE9j\xE0 d\xE9rang\xE9 quelqu'un d'autre ?`,
      type: "textarea"
    },
    {
      id: "q5",
      label: `A-t-on d\xE9j\xE0 remarqu\xE9 que vous cessiez de respirer durant votre sommeil ?`,
      type: "textarea"
    },
    {
      id: "q6",
      label: `Combien de fois vous arrive-t-il de vous sentir fatigu\xE9 ou las apr\xE8s votre nuit de sommeil ?`,
      type: "textarea"
    },
    {
      id: "q7",
      label: `Vous sentez-vous fatigu\xE9, las ou peu en forme durant votre p\xE9riode d'\xE9veil ?`,
      type: "textarea"
    },
    {
      id: "q8",
      label: `Vous est-il arriv\xE9 de vous assoupir ou de vous endormir auvolant de votre v\xE9hicule ?`,
      type: "textarea"
    },
    {
      id: "q9",
      label: `Souffrez-vous d'hypertension art\xE9rielle ?`,
      type: "textarea"
    },
    {
      id: "q1",
      label: `Regardez la colonne de gauche pour trouver votre taille en centim\xE8tres`,
      type: "textarea"
    },
    {
      id: "q2",
      label: `Trouvez le nombre le plus proche de votre poids sur la m\xEAme ligne horizontale que celle de`,
      type: "textarea"
    },
    {
      id: "q3",
      label: `Votre IMC apparait en bas de la colonne ou se trouve votre poids`,
      type: "textarea"
    },
    {
      id: "q4",
      label: `Reportez votre indice IMC dans le cadre de la cat\xE9gorie 3`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/sommeil/questionnaire-de-fatigue-de-pichot-pro-def.ts
var questionnaire_de_fatigue_de_pichot_pro_def = {
  metadata: {
    id: "questionnaire-de-fatigue-de-pichot-pro-def",
    title: `questionnaire de fatigue de pichot pro def`,
    category: "sommeil"
  },
  questions: [
    {
      id: "block-01",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Questionnaire de fatigue de Pichot  Parmi les 8 propositions suivantes, d\xE9terminez celles qui correspondent le mieux \xE0 votre \xE9tat en affectant une note entre 0 et 4 :  (0 = pas du tout ; 1 = un peu ; 2 = moyennement ; 3 = beaucoup ; 4 = extr\xEAmement)  0   1   2   3   4  Je manque d\u2019\xE9nergie  Tout me demande un effort  Je me sens faible \xE0 certains endroits du corps  J\u2019ai les bras ou les jambes lourdes  Je me sens fatigu\xE9 sans raison  J\u2019ai envie de m\u2019allonger pour me reposer  J\u2019ai du mal \xE0 me concentrer  Je me sens fatigu\xE9, lourd et raide  Score : total des points  La fatigue est d\xE9finie comme une sensation d\u2019affaiblissement physique ou psychique qui survient normalement \xE0 la suite d\u2019un effort soutenu, et qui impose la mise au repos.  Cependant, cette fatigue physiologique peut devenir pathologique lorsque la personne se sent handicap\xE9e, invalid\xE9e ou g\xEAn\xE9e par rapport \xE0 son niveau de forme habituelle pour effectuer ses activit\xE9s quotidiennes.  L\u2019\xE9chelle subjective de Pichot mesure l\u2019importance de cette g\xEAne, handicap.  Un score total > 22 est un signe de fatigue  Le sommeil peut \xEAtre inefficace, il existe de nombreuses causes \xE0 la fatigue qui doivent \xEAtre explor\xE9es.`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/sommeil/questionnaire-du-sommeil-psqi-def-my-et-pro.ts
var questionnaire_du_sommeil_psqi_def_my_et_pro = {
  metadata: {
    id: "questionnaire-du-sommeil-psqi-def-my-et-pro",
    title: `questionnaire du sommeil psqi def my et pro`,
    category: "sommeil"
  },
  questions: [
    {
      id: "block-01",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Questionnaire :  Index de Qualit\xE9 du Sommeil de Pittsburgh (PSQI)  Les questions suivantes ont trait \xE0 vos habitudes de sommeil pendant le dernier mois seulement. Vos r\xE9ponses doivent indiquer ce qui correspond aux exp\xE9riences que vous avez eues pendant la majorit\xE9 des jours et des nuits au cours du dernier mois. R\xE9pondez \xE0 toutes les questions.  1/ Au cours du mois dernier, quand \xEAtes-vous habituellement all\xE9 vous coucher le soir ?  Heure habituelle du coucher : ...............  2/ Au cours du mois dernier, combien vous a-t-il habituellement fallu de temps (en minutes) pour vous endormir chaque soir ?  Nombre de minutes : ...............  3/ Au cours du mois dernier, quand vous \xEAtes-vous habituellement lev\xE9 le matin ?  Heure habituelle du lever : ...............  4/ Au cours du mois dernier, combien d\u2019heures de sommeil effectif avez-vous eu chaque nuit ? (Ce nombre peut \xEAtre diff\xE9rent du nombre d\u2019heures que vous avez pass\xE9 au lit)  Heures de sommeil par nuit : ...............  Pour chacune des questions suivantes, indiquez la meilleure r\xE9ponse. R\xE9pondez \xE0 toutes les questions.  5/ Au cours du mois dernier, avec quelle fr\xE9quence avez-vous eu des troubles du sommeil car \u2026  Pas au cours du dernier mois  Moins d\u2019une fois par semaine  Une ou deux fois par semaine  Trois ou quatre fois par semaine  a) Vous n\u2019avez pas pu vous endormir en moins de 30 mn  b) Vous vous \xEAtes r\xE9veill\xE9 au milieu de la nuit ou pr\xE9cocement le matin  c) Vous avez d\xFB vous lever pour aller aux toilettes.  d) Vous n\u2019avez pas pu respirer correctement  e) Vous avez touss\xE9 ou ronfl\xE9 bruyamment  f) Vous avez eu trop froid  g) Vous avez eu trop chaud  h) Vous avez eu de mauvais r\xEAves`,
      type: "textarea"
    },
    {
      id: "block-02",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  i) Vous avez eu des douleurs  j) Pour d\u2019autre(s) raison(s). Donnez une description :  Indiquez la fr\xE9quence des troubles du sommeil pour ces raisons :  Pas au cours du dernier mois  Moins d\u2019une fois par semaine  Une ou deux fois par semaine  Trois ou quatre fois par semaine  6/ Au cours du mois dernier, comment \xE9valueriez-vous globalement la qualit\xE9 de votre sommeil ?  Tr\xE8s bonne   Assez bonne   Assez mauvaise   Tr\xE8s mauvaise  7/ Au cours du mois dernier, combien de fois avez-vous pris des m\xE9dicaments  (prescrits par votre m\xE9decin ou achet\xE9s sans ordonnance) pour faciliter votre  sommeil ?  Pas au cours   Moins d\u2019une fois   Une ou deux fois   Trois ou quatre fois  du dernier mois   par semaine   par semaine   par semaine  8/ Au cours du mois dernier, combien de fois avez-vous eu des difficult\xE9s \xE0  demeurer \xE9veill\xE9(e) pendant que vous conduisiez, preniez vos repas, \xE9tiez  occup\xE9(e) dans une activit\xE9 sociale ?  Pas au cours   Moins d\u2019une fois   Une ou deux fois   Trois ou quatre fois  du dernier mois   par semaine   par semaine   par semaine  9/ Au cours du mois dernier, \xE0 quel degr\xE9 cela a-t-il repr\xE9sent\xE9 un probl\xE8me pour  vous d\u2019avoir assez d\u2019enthousiasme pour faire ce que vous aviez \xE0 faire ?  Pas du tout   Seulement un   Un certain probl\xE8me   Un tr\xE8s gros  un probl\xE8me   tout petit probl\xE8me   probl\xE8me`,
      type: "textarea"
    },
    {
      id: "block-03",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  10/ Avez-vous un conjoint ou un camarade de chambre ?  Ni l\u2019un, ni l\u2019autre.  Oui, mais dans une chambre diff\xE9rente.  Oui, dans la m\xEAme chambre mais pas dans le m\xEAme lit.  Oui, dans le m\xEAme lit.  11/ Si vous avez un camarade de chambre ou un conjoint, demandez-lui combien  de fois le mois dernier vous avez pr\xE9sent\xE9 :  Pas au cours du dernier mois  Moins d\u2019une fois par semaine  Une ou deux fois par semaine  Trois ou quatre fois par semaine  a)   U n ronflement fort  b)   D e longues pauses respiratoires pendant  votre sommeil  c) Des saccades ou des secousses des jambes pendant que vous dormiez  d) Des \xE9pisodes de d\xE9sorientation ou de confusion pendant le sommeil  e) D\u2019autres motifs d\u2019agitation pendant le sommeil  Score total PSQI :`,
      type: "textarea"
    },
    {
      id: "block-04",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Calcul du score global au PSQI  Le PSQI comprend 19 questions d\u2019auto-\xE9valuation et 5 questions pos\xE9es au conjoint ou compagnon de chambre (s\u2019il en est un). Seules les questions d\u2019auto-\xE9valuation sont incluses dans le score. Les 19 questions d\u2019auto-\xE9valuation se combinent pour donner 7 \u201Ccomposantes\u201D du score global, chaque composante recevant un score de 0 \xE0 3.  Dans tous les cas, un score de 0 indique qu\u2019il n\u2019y a aucune difficult\xE9 tandis qu\u2019un score de 3 indique l\u2019existence de difficult\xE9s s\xE9v\xE8res. Les 7 composantes du score s\u2019additionnent pour donner un score global allant de 0 \xE0 21 points, 0 voulant dire qu\u2019il n\u2019y a aucune difficult\xE9, et 21 indiquant au contraire des difficult\xE9s majeures.  Composante 1 : Qualit\xE9 subjective du sommeil  Examinez la question 6, et attribuez un score :  Tr\xE8s bonne = 0  Assez bonne = 1  Assez mauvaise = 2  Tr\xE8s mauvaise= 3  Score de la composante 1 = \u2026..  Composante 2 : Latence du sommeil  Examinez la question 2, et attribuez un score :  \u226415 mn =0  16-30 mn = 1  31-60 mn = 2  >60 mn = 3  Score de la question 2 = ..\u2026  Examinez la question 5a, et attribuez un score :  Pas au cours   Moins d\u2019une fois   Une ou deux fois   Trois ou quatre fois  du dernier mois = 0   par semaine = 1   par semaine = 2   par semaine = 3  Score de la question 5a = \u2026..`,
      type: "textarea"
    },
    {
      id: "block-05",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Additionnez les scores des questions 2 et 5a, et attribuez le score de la composante 2 :  Somme de 0 = 0  Somme de 1-2 = 1  Somme de 3-4 = 2  Somme de 5-6 = 3  Score de la composante 2 = \u2026..  Composante 3 : Dur\xE9e du sommeil  Examinez la question 4, et attribuez un score :  >7 h =0  6-7 h = 1  5-6 h = 2  <5 h = 3  Score de la composante 3 = ..\u2026  Composante 4 : Efficacit\xE9 habituelle du sommeil  Indiquez le nombre d\u2019heures de sommeil (question 4) : \u2026..  Calculez le nombre d\u2019heures pass\xE9es au lit :  Heure du lever (question 3) : \u2026..  Heure du coucher (question 1) : \u2026..  Nombre d\u2019heures pass\xE9es au lit : \u2026..  Calculez l\u2019efficacit\xE9 du sommeil : (Nb heures sommeil/Nb heures au lit)\xD7100 = Efficacit\xE9  habituelle (en %)  \u21D2   (\u2026\u2026..\u2026/\u2026\u2026....)\xD7100 = \u2026\u2026.... %`,
      type: "textarea"
    },
    {
      id: "block-06",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Attribuez le score de la composante 4 :  >85% = 0  75-84% = 1  65-74% = 2  <65% = 3  Score de la composante 4 = ..\u2026  Composante 5 : Troubles du sommeil  Examinez les questions 5b \xE0 5j, et attribuez des scores \xE0 chaque question :  Pas au cours   Moins d\u2019une fois   Une ou deux fois   Trois ou quatre  du dernier mois = 0   par semaine = 1   par semaine = 2   fois par semaine = 3  Score de la question 5b = \u2026.. 5c = \u2026.. 5d = \u2026.. 5e = \u2026.. 5f = \u2026..  5g = \u2026.. 5h = \u2026.. 5i = \u2026.. 5j = \u2026..  Additionnez les scores des questions 5b \xE0 5j, et attribuez le score de la composante 5 :  Somme de 0 = 0  Somme de 1-9 = 1  Somme de 10-18 = 2  Somme de 19-27 = 3  Score de la composante 5 = \u2026..`,
      type: "textarea"
    },
    {
      id: "block-07",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Composante 6 : Utilisation d\u2019un m\xE9dicament du sommeil  Examinez la question 7, et attribuez un score :  Pas au cours   Moins d\u2019une fois   Une ou deux fois   Trois ou quatre fois  du dernier mois = 0   par semaine = 1   par semaine = 2   par semaine = 3  Score de la composante 6 = \u2026..  Composante 7 : Mauvaise forme durant la journ\xE9e  Examinez la question 8, et attribuez un score :  Pas au cours   Moins d\u2019une fois   Une ou deux fois   Trois ou quatre fois  du dernier mois = 0   par semaine = 1   par semaine = 2   par semaine = 3  Score de la question 8 = \u2026..  Examinez la question 9, et attribuez un score :  Pas du tout   Seulement un   Un certain   Un tr\xE8s gros  un probl\xE8me = 0   tout petit probl\xE8me = 1   probl\xE8me = 2   probl\xE8me = 3  Score de la question 9 = \u2026..  Additionnez les scores des questions 8 et 9, et attribuez le score de la composante 7 :  Somme de 0 = 0  Somme de 1-2 = 1  Somme de 3-4 = 2  Somme de 5-6 = 3  Score de la composante 7 = \u2026..  Score global au PSQI  Additionnez les scores des 7 composantes : \u2026..`,
      type: "textarea"
    },
    {
      id: "block-08",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Commentaire pour vous aider \xE0 conseiller le patient : \xAB My \xBB  Le sommeil est une fonction fondamentale de la sant\xE9 et du bien-\xEAtre. Votre questionnaire explore diff\xE9rentes dimensions qui caract\xE9risent un \xAB bon sommeil \xBB ou un \xAB sommeil perturb\xE9 \xBB : La dur\xE9e et les horaires de sommeil/r\xE9veil, la qualit\xE9 et l\u2019efficacit\xE9 du sommeil, l\u2019impact de votre sommeil sur votre \xE9veil et votre journ\xE9e\u2026 chacune de ces dimensions compl\xE9mentaires est importante pour votre \xE9quilibre. Des solutions personnalis\xE9es peuvent vous \xEAtre propos\xE9es afin de corriger certains troubles du sommeil.  Commentaire pour les professionnels de sant\xE9 et de soins :   \xAB Pro \xBB  Le questionnaire PSQI de votre patient explore plusieurs dimensions du sommeil : horaires, dur\xE9e, qualit\xE9, efficacit\xE9\u2026 celles-ci sont ind\xE9pendantes mais interagissent les unes sur les autres aboutissant \xE0 un score global de sommeil. Les suggestions th\xE9rapeutiques (m\xE9dicamenteuses ou non m\xE9dicamenteuses, nutritionnelles, micronutritionnelles, conseils de modes de vie \u2026) doivent s\u2019adapter \xE0 chaque dimension. Une r\xE9\xE9valuation r\xE9guli\xE8re du PSQI est vivement conseill\xE9e.`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/stress/questionnaire-de-karasek-def-pro.ts
var questionnaire_de_karasek_def_pro = {
  metadata: {
    id: "questionnaire-de-karasek-def-pro",
    title: `questionnaire de karasek def pro`,
    category: "stress"
  },
  questions: [
    {
      id: "block-01",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Questionnaire de Karasek  Mod\xE8le du stress de Karasek et Theorell (1990)  Les diff\xE9rents items du   questionnaire de Karasek   permettent d\u2019appr\xE9cier 3 \xE9l\xE9ments :   latitude d\xE9cisionnelle , demande psychologique   et   soutien social . On compl\xE8te souvent ce questionnaire par des questions portant sur la   reconnaissance au travail , issues du questionnaire de Siegrist. On obtient ainsi un questionnaire d\u2019\xE9valuation collective du bien \xEAtre au travail.  Pour chaque question, 4 r\xE9ponses sont propos\xE9es :  \u2022   Pas du tout d\u2019accord   : compter   1   pour calculer le score  \u2022   Pas d\u2019accord   : compter   2   pour calculer le score  \u2022   D\u2019accord   : compter   3   pour calculer le score  \u2022   Tout \xE0 fait d\u2019accord   : compter   4   pour calculer le score  La Latitude d\xE9cisionnelle  Elle prend en compte \xE0 la fois l \u2019autonomie d\xE9cisionnelle   et l \u2019utilisation des comp\xE9tences.  L\u2019autonomie d\xE9cisionnelle  L \u2019autonomie d\xE9cisionnelle , c\u2019est \xE0 dire de contr\xF4le : c\u2019est la possibilit\xE9 de choisir sa   fa\xE7on de travailler , de   participer aux d\xE9cisions   qui s\u2019y rattachent.  3 questions   du   questionnaire de Karasek   explorent l \u2019autonomie d\xE9cisionnelle   :  Question 4 : Q4 Mon travail me permet souvent de prendre des d\xE9cisions moi-m\xEAme  Pas du tout d\u2019accord   1  Pas d\u2019accord   2  D\u2019accord   3  Tout \xE0 fait   d\u2019accord   4  Question 6 : Q6 Dans ma t\xE2che, j\u2019ai tr\xE8s peu de libert\xE9 pour d\xE9cider comment je fais mon travail  Pas du tout d\u2019accord   : compter   1   pour calculer le score   1  Pas d\u2019accord   : compter   2   pour calculer le score   2  D\u2019accord   : compter   3   pour calculer le score   3  Tout \xE0 fait d\u2019accord   : compter   4   pour calculer le score   4  Question 8 : Q8 J\u2019ai la possibilit\xE9 d\u2019influencer le d\xE9roulement de mon travail  Pas du tout d\u2019accord   : compter   1   pour calculer le score   1  Pas d\u2019accord   :   compter   2   pour calculer le score   2  D\u2019accord   : compter   3   pour calculer le score   3  Tout \xE0 fait d\u2019accord   : compter   4   pour calculer le score   4`,
      type: "textarea"
    },
    {
      id: "block-02",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Calcul du score pour l\u2019 autonomie   = 4 x [   Q4   + ( 5-Q6 ) +   Q8   ]  L\u2019utilisation des comp\xE9tences  L\u2019 utilisation des comp\xE9tences , c\u2019est la possibilit\xE9 d\u2019 utiliser ses propres comp\xE9tences   et d\u2019en   d\xE9velopper de nouvelles.  6 questions   du   questionnaire de Karasek   explorent l \u2018utilisation des comp\xE9tences  Question 1 : Q1  Dans mon travail, je dois apprendre des   choses nouvelles  Pas du tout d\u2019accord   1  Pas d\u2019accord   2  D\u2019accord   3  Tout \xE0 fait d\u2019accord   4  Question 2 : Q2  Dans mon travail j\u2019effectue des t\xE2ches r\xE9p\xE9titives  Pas du tout d\u2019accord   1  Pas d\u2019accord   2  D\u2019accord   3  Tout \xE0 fait d\u2019accord   4  Question 3 : Q3  Mon travail me demande d\u2019\xEAtre cr\xE9atif  Pas du tout d\u2019accord   1  Pas d\u2019accord   2  D\u2019accord   3  Tout \xE0 fait d\u2019accord   4  Question 5 : Q5  Mon travail me demande un haut niveau de comp\xE9tence  Pas du tout d\u2019accord   1  Pas d\u2019accord   2  D\u2019accord   3  Tout \xE0 fait d\u2019accord   4  Question 7 : Q7  Dans mon travail, j\u2019ai des activit\xE9s vari\xE9es  Pas du tout d\u2019accord   1  Pas d\u2019accord   2  D\u2019accord   3  Tout \xE0 fait d\u2019accord   4  Question 9 : Q9  J \u2019ai l\u2019occasion de d\xE9velopper mes comp\xE9tences   professionnelles  Pas du tout d\u2019accord   1  Pas d\u2019accord   2  D\u2019accord   3  Tout \xE0 fait d\u2019accord   4  Calcul du score pour l\u2019utilisation des comp\xE9tences =   2   x [   Q1   + ( 5-Q2 ) +   Q3   +   Q5   +   Q7   +   Q9   ]`,
      type: "textarea"
    },
    {
      id: "block-03",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Calcul du score pour la   latitude d\xE9cisionnelle   : additionner le   score de l\u2019autonomie   + le   score de l\u2019utilisation des comp\xE9tences . Le seuil pour la latitude d\xE9cisionnelle est \xE0   70   ( il est \xE0 72 aux USA). Les scores du questionnaire de Karasek ont \xE9t\xE9 fix\xE9s en France gr\xE2ce \xE0 l\u2019enqu\xEAte summer  La demande psychologique  C\u2019est la   charge psychologique   associ\xE9e \xE0 l\u2019ex\xE9cution des t\xE2ches, \xE0 la   quantit\xE9   et \xE0 la   complexit\xE9   des t\xE2ches, aux   t\xE2ches impr\xE9vues , aux   contraintes de temps , aux interruptions et aux demandes contradictoires.  9 questions   du   questionnaire de Karasek   explorent la   demande psychologique  Question 10 : Q10 Mon travail me demande de travailler tr\xE8s vite  Pas du tout d\u2019accord   1  Pas d\u2019accord   2  D\u2019accord   3  Tout \xE0 fait d\u2019accord   4  Question 11 : Q11 Mon travail demande de travailler intens\xE9ment  Pas du tout d\u2019accord   1  Pas d\u2019accord   2  D\u2019accord   3  Tout \xE0 fait d\u2019accord   4  Question 12 : Q12 On me demande d\u2019effectuer une quantit\xE9 de travail excessive  Pas du tout d\u2019accord   1  Pas d\u2019accord   2  D\u2019accord   3  Tout \xE0 fait d\u2019accord   4  Question 13 : Q13  Je dispose du temps n\xE9cessaire pour effectuer correctement mon travail  Pas du tout d\u2019accord   1  Pas d\u2019accord   2  D\u2019accord   3  Tout \xE0 fait d\u2019accord   4  Question 14 : Q14  Je re\xE7ois des ordres contradictoires de la part   d\u2019autres personnes  Pas du tout d\u2019accord   1  Pas d\u2019accord   2  D\u2019accord   3  Tout \xE0 fait d\u2019accord   4  Question 15 : Q15  Mon travail n\xE9cessite de longues p\xE9riodes de concentration intense  Pas du tout d\u2019accord   1  Pas d\u2019accord   2  D\u2019accord   3  Tout \xE0 fait d\u2019accord   4  Question 16 : Q16 Mes t\xE2ches sont souvent interrompues avant d\u2019\xEAtre achev\xE9es, n\xE9cessitant de les reprendre plus tard`,
      type: "textarea"
    },
    {
      id: "block-04",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Pas du tout d\u2019accord   1  Pas d\u2019accord   2  D\u2019accord   3  Tout \xE0 fait d\u2019accord   4  Question 17 : Q17  Mon travail est   \xAB   tr\xE8s bouscul\xE9   \xBB  Pas du tout d\u2019accord   1  Pas d\u2019accord   2  D\u2019accord   3  Tout \xE0 fait d\u2019accord   4  Question 18 : Q18 Attendre le travail de coll\xE8gues ralentit souvent mon propre travail  Pas du tout d\u2019accord   1  Pas d\u2019accord   2  D\u2019accord   3  Tout \xE0   fait d\u2019accord   4  Calcul du score pour la   demande psychologique   :  Q10   +   Q11   +   Q12 +(   5-Q13 ) +   Q14   +   Q15   +   Q16 +   Q17   +   Q18  Le score est calcul\xE9 sur 36, le seuil est \xE0   21   ( il est \xE0 24 aux USA).  Le   Job strain , c\u2019est \xE0 dire la   tension au travail   est la combinaison d\u2019une   faible latitude d\xE9cisionnelle   et d\u2019une   forte demande psychologique .  Si le score de demande psychologique est sup\xE9rieur \xE0 21 et le score de latitude d\xE9cisionnelle inf\xE9rieur \xE0 72, l\u2019individu est dans le cadran \xAB stress\xE9 \xBB et donc consid\xE9r\xE9 en situation de Job strain.  Dans le cadre d\u2019une \xE9tude :  \u2022   soit on utilise ces   valeurs donn\xE9es par SUMER   pour situer les individus sur le diagramme ( ce qui permet alors de comparer la population \xE9tudi\xE9e avec l\u2019\xE9chantillon national),  \u2022   soit on utilise les   valeurs m\xE9dianes de la latitude d\xE9cisionnelle   et   de la demande psychologique   pour situer les individus sur le diagramme ( on utilisera la valeur m\xE9diane obtenue pour la demande psychologique au sein de la population \xE9tudi\xE9e au lieu de 21 et la valeur m\xE9diane de la latitude d\xE9cisionnelle au sein de la population \xE9tudi\xE9e au lieu de 72)  \xAB Job strain model \xBB Karasek 1979`,
      type: "textarea"
    },
    {
      id: "block-05",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  \u2022   Le   sujet est d\xE9tendu , s\u2019il b\xE9n\xE9ficie d\u2019une   faible demande psychologique   et d\u2019une   grande autonomie   pour r\xE9aliser son travail.  \u2022   Le   sujet est actif , s\u2019il dispose d\u2019une   forte demande psychologique   mais \xE9galement d\u2019une   grande autonomie .  \u2022   Par contre un   sujet est passif , s\u2019il dispose \xE0 la fois d\u2019une   faible demande psychologique   et d\u2019une   faible autonomie .  Le Soutien social  C\u2019est l\u2019aide et la reconnaissance des coll\xE8gues et de la hi\xE9rarchie.  Soutien social de la part de la hi\xE9rarchie  4 questions   du   questionnaire de Karasek   explorent le   soutien social de la hi\xE9rarchie.  Question 19 : Q19 Mon sup\xE9rieur se sent concern\xE9 par le bien-\xEAtre de ses subordonn\xE9s  Pas du tout d\u2019accord   1  Pas d\u2019accord   2  D\u2019accord   3  Tout \xE0 fait d\u2019accord   4  Question 20 : Q20 Mon sup\xE9rieur pr\xEAte attention \xE0 ce que je dis  Pas du tout d\u2019accord   1  Pas d\u2019accord   2  D\u2019accord   3  Tout \xE0 fait d\u2019accord   4  Question 21 : Q21 Mon sup\xE9rieur m\u2019aide \xE0 mener ma t\xE2che \xE0 bien  Pas du tout d\u2019accord   1  Pas d\u2019accord   2`,
      type: "textarea"
    },
    {
      id: "block-06",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  D\u2019accord   3  Tout \xE0 fait d\u2019accord   4  Question 22 : Q22  Mon sup\xE9rieur r\xE9ussit facilement \xE0 faire collaborer ses subordonn\xE9s  Pas du tout d\u2019accord   1  Pas d\u2019accord   2  D\u2019accord   3  Tout \xE0 fait d\u2019accord   4  Calcul du score   soutien social de la part de la hi\xE9rarchie   :   Q19   +   Q20   +   Q21   +   Q22  Le score est calcul\xE9 sur 16, le seuil est \xE0 8  Soutien social de la part des coll\xE8gues  4 questions   du   questionnaire de Karasek   explorent le   soutien social de la part des coll\xE8gues.  Question 23 : Q23 Les coll\xE8gues avec qui je travaille sont des gens professionnellement comp\xE9tents  Pas du tout d\u2019accord   1  Pas d\u2019accord   2  D\u2019accord   3  Tout \xE0 fait   d\u2019accord   4  Question 24 : Q24 Les coll\xE8gues avec qui je travaille me manifestent de l\u2019int\xE9r\xEAt  Pas du tout d\u2019accord   1  Pas d\u2019accord   2  D\u2019accord   3  Tout \xE0 fait d\u2019accord   4  Question 25 : Q25 Les coll\xE8gues avec qui je travaille sont amicaux  Pas du   tout d\u2019accord   1  Pas d\u2019accord   2  D\u2019accord   3  Tout \xE0 fait d\u2019accord   4  Question 26 : Q26 Les coll\xE8gues avec qui je travaille m\u2019aident \xE0 mener les t\xE2ches \xE0 bien  Pas du tout d\u2019accord   1  Pas d\u2019accord   2  D\u2019accord   3  Tout \xE0 fait d\u2019accord   4  Calcul du score   soutien social de la part des coll\xE8gues   : Q23 + Q24 + Q25+ Q26 Le score est calcul\xE9 sur 16, le seuil est \xE0 8  Le score du   soutien social   est la somme :   soutien social de la part de la hi\xE9rarchie   +   soutien social de la part des coll\xE8gues  Si le score de soutien social est inf\xE9rieur \xE0 24, on consid\xE8re qu\u2019il est faible.  L\u2019Isostrain est la combinaison du Job strain \xE0 un faible soutien social ( inf\xE9rieur \xE0 24).  Reconnaissance`,
      type: "textarea"
    },
    {
      id: "block-07",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  6 questions explorent la   reconnaissance au travail.  Question 27 : Q27 On me traite injustement dans mon travail  Pas du tout d\u2019accord   1  Pas d\u2019accord   2  D\u2019accord   3  Tout \xE0 fait d\u2019accord   4  Question 28 : Q28 Ma s\xE9curit\xE9 d\u2019emploi est menac\xE9e  Pas du tout d\u2019accord   1  Pas d\u2019accord   2  D\u2019accord   3  Tout \xE0 fait   d\u2019accord   4  Question 29 : Q29 Ma position professionnelle actuelle correspond bien \xE0 ma formation  Pas du tout d\u2019accord   1  Pas d\u2019accord   2  D\u2019accord   3  Tout \xE0 fait d\u2019accord   4  Question 30 : Q30 Vu tous mes efforts, je re\xE7ois le respect et l\u2019estime que je m\xE9rite  Pas du tout d\u2019accord   1  Pas d\u2019accord   2  D\u2019accord   3  Tout \xE0 fait d\u2019accord   4  Question 31 : Q31 Vu tous mes efforts, mes perspectives de promotion sont satisfaisantes  Pas du tout d\u2019accord   1  Pas d\u2019accord   2  D\u2019accord   3  Tout \xE0 fait d\u2019accord   4  Question 32 : Q32 Vu tous mes efforts, mon salaire est satisfaisant  Pas du tout d\u2019accord   1  Pas d\u2019accord   2  D\u2019accord   3  Tout \xE0 fait d\u2019accord   4  Calcul du score reconnaissance : (   5-Q27 ) + ( 5-Q28 ) +   Q29   +   Q30   +   Q31   +   Q32  Le score est calcul\xE9 sur 24  Une situation de travail est g\xE9n\xE9ratrice de stress si elle associe: des exigences \xE9lev\xE9es au niveau du travail, peu ou pas de contr\xF4le sur son propre travail et un soutien social faible de la part de l\u2019\xE9quipe de travail ou de la hi\xE9rarchie.  Le questionnaire de Karasek peut \xEAtre utilis\xE9 de diverses mani\xE8res : les scores peuvent \xEAtre compar\xE9s au sein d\u2019une m\xEAme entreprise, entre divers services, divers m\xE9tiers, etc Les scores peuvent \xEAtre compar\xE9s \xE0 ceux d\u2019une population de r\xE9f\xE9rence, etc`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/stress/questionnaire-de-stress-de-cungi-def-pro.ts
var questionnaire_de_stress_de_cungi_def_pro = {
  metadata: {
    id: "questionnaire-de-stress-de-cungi-def-pro",
    title: `Questionnaire :`,
    category: "stress"
  },
  questions: [
    {
      id: "q1",
      label: `Comment le remplir ?`,
      type: "select",
      options: [
        { label: ``, value: "" },
        { label: ``, value: "" }
      ]
    },
    {
      id: "q2",
      label: `Comment l\u2019interpr\xE9ter ?`,
      type: "select",
      options: [
        { label: ``, value: "" },
        { label: ``, value: "" },
        { label: ``, value: "" },
        { label: ``, value: "" },
        { label: ``, value: "" },
        { label: ``, value: "" }
      ]
    }
  ]
};

// src/questionnaires/stress/questionnaire-de-stress-siin-def-pro.ts
var questionnaire_de_stress_siin_def_pro = {
  metadata: {
    id: "questionnaire-de-stress-siin-def-pro",
    title: `questionnaire de stress siin def pro`,
    category: "stress"
  },
  questions: [
    {
      id: "block-01",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Questionnaire :  Stress  Veuillez remplir spontan\xE9ment, sans trop r\xE9fl\xE9chir, le questionnaire individuel suivant compos\xE9 de 21 questions. Chaque question se r\xE9f\xE8re aux derni\xE8res semaines de fa\xE7on g\xE9n\xE9rale. Les r\xE9ponses seront cot\xE9es 0, 1 ou 2.  N\xB0   Ces derni\xE8res semaines je   ressens\u2026 Rarement = 0/Parfois = 1/Souvent = 2   0   1   2  A1   J\u2019ai du mal \xE0 me r\xE9veiller le matin, je dois souvent prendre un caf\xE9 ou des stimulants  A2   Je me sens vite fatigu\xE9(e), m\xEAme sans effort  A3   J\u2019ai des troubles de la concentration, j\u2019oublie des choses facilement  A4   Je me sens moins en forme au quotidien  A5   J\u2019ai parfois des coups de pompe, des vertiges, une faiblesse soudaine  A6   Je suis d\xE9motiv\xE9(e), je n\u2019ai go\xFBt \xE0 rien et j\u2019ai tendance \xE0 remettre \xE0 demain ce que je dois faire  A7   J\u2019ai parfois la t\xEAte vide, je suis distrait(e)  B8   Je me sens tendu(e) et nerveux(se), souvent agit\xE9(e)  B9   Je rencontre des difficult\xE9s pour m\u2019endormir, je pense souvent \xE0 des soucis  B10   Je suis nerveux(se), inquiet(e) et parfois anxieux(se)  B11   Je n\u2019arrive pas \xE0 prendre du temps pour d\xE9compresser, me d\xE9tendre  B12   Je me r\xE9veille souvent dans la nuit ou fin de nuit  B13   Un rien me stress, m\u2019\xE9nerve et me fait r\xE9agir  B14   Je suis tr\xE8s exigeant(e), envers moi-m\xEAme et les autres  C15   J\u2019ai souvent mal au dos, \xE0 la nuque ou des maux de t\xEAte  C16   J\u2019ai des palpitations cardiaques, des tremblements  C17   J\u2019ai une respiration courte et rapide, je suis essouffl\xE9(e), je soupire souvent  C18   J\u2019ai parfois un n\u0153ud creux de l\u2019estomac, la gorge serr\xE9e  C19   J\u2019ai des troubles digestifs ou intestinaux, des douleurs au ventre  C20   J\u2019ai des secousses musculaires, au niveau du visage, des paupi\xE8res  C21   Je fume, je bois de l\u2019alcool ou prends d\u2019autres substances pour me stimuler ou me calmer  Score total questions 1 \xE0 7  Score total questions 8 \xE0 14  Score total questions   15   \xE0   21  Score total des 21 questions`,
      type: "textarea"
    },
    {
      id: "block-02",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Commentaire pour les professionnels de sant\xE9 et de soins : \xAB Pro \xBB  Questionnaire score  < 4   Oriente vers les conseils de vie \xAB antistress  5 \xE0 14  Avec une majorit\xE9 de r\xE9ponses A   :  oriente vers le   protocole "dopaminergique\xBB   durant 15 jours puis r\xE9\xE9valuation du score  Avec une majorit\xE9 de r\xE9ponses B :  oriente cers le   protocole \xAB   s\xE9rotoinergique \xBB   durant 15 jours puis r\xE9\xE9valuation du score  Avec une majorit\xE9 de r\xE9ponses C :  oriente vers le   protocole \xAB   mixte dopaminergique + s\xE9rotoninergique   \xBB   10 jours puis r\xE9\xE9valuation  > 15   Oriente vers le   protocole \xAB   mixte dopaminergique + s\xE9rotoninergique   \xBB   durant 10 jours puis r\xE9\xE9valuation du score`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/stress/questionnaire-echelle-de-stress-de-cohen-pss-pro.ts
var questionnaire_echelle_de_stress_de_cohen_pss_pro = {
  metadata: {
    id: "questionnaire-echelle-de-stress-de-cohen-pss-pro",
    title: `questionnaire echelle de stress de cohen pss pro`,
    category: "stress"
  },
  questions: [
    {
      id: "block-01",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Questionnaire :  Echelle de stress de Cohen PSS  Question 1- Au cours du dernier mois combien de fois, avez-vous \xE9t\xE9 d\xE9rang\xE9 (e) par un \xE9v\xE8nement inattendu  Jamais   1  Presque jamais   2  Parfois   3  Assez souvent   4  Souvent   5  Question 2 \u2013 Au cours du dernier mois combien de fois vous a-t-il sembl\xE9 difficile de contr\xF4ler les choses importantes de votre vie ?  Jamais   1  Presque jamais   2  Parfois   3  Assez souvent   4  Souvent   5  Question 3 \u2013 Au cours du dernier mois combien de fois vous \xEAtes-vous senti(e) nerveux(se) ou stress\xE9(e) ?  Jamais   1  Presque jamais   2  Parfois   3  Assez souvent   4  Souvent   5  Question 4   \u2013   Au cours du dernier mois combien de fois vous \xEAtes - vous senti(e)  confiant(e) \xE0 prendre en main vos   probl\xE8mes personnels   ?  Jamais   5  Presque jamais   4  Parfois   3  Assez souvent   2  Souvent   1  Question 5 \u2013 Au cours du dernier mois combien de fois avez-vous senti que les choses allaient comme vous le vouliez ?  Jamais   5  Presque jamais   4  Parfois   3  Assez souvent   2  Souvent   1  Question 6 \u2013 Au cours du dernier mois combien de fois avez-vous pens\xE9 que vous ne pouviez pas assumer toutes les choses que vous deviez faire ?  Jamais   1  Presque jamais   2  Parfois   3  Assez souvent   4  Souvent   5  Question 7 \u2013 Au cours du dernier mois combien de fois avez-vous \xE9t\xE9 capable de ma\xEEtriser votre \xE9nervement ?  Jamais   5  Presque jamais   4`,
      type: "textarea"
    },
    {
      id: "block-02",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Parfois   3  Assez souvent   2  Souvent   1  Question 8   \u2013   Au cours du dernier mois combien de fois   avez - vous senti que vous  dominiez la situation   ?  Jamais   5  Presque jamais   4  Parfois   3  Assez souvent   2  Souvent   1  Question 9   \u2013   Au cours du dernier mois combien de fois vous \xEAtes - vous senti(e)  irrit\xE9(e) parce que \xE9v\xE8nements \xE9chappaient \xE0 v\xF4tre   contr\xF4le   ?  Jamais   1  Presque jamais   2  Parfois   3  Assez souvent   4  Souvent   5  Question 10   \u2013   Au cours du dernier mois combien de fois avez - vous trouv\xE9 que les  difficult\xE9s s\u2019accumulaient \xE0 un tel point que vous ne pouviez les contr\xF4ler   ?  Jamais   1  Presque jamais   2  Parfois   3  Assez souvent   4  Souvent   5  Commentaire pour le professionnel de sant\xE9 et de soins : \xAB Pro \xBB  Le calcul de score de Cohen se fait sur la somme des points obtenus pour les 10 questions.  Score inf\xE9rieur \xE0 21 : bonne gestion du stress  votre patient semble bien avoir de bonnes capacit\xE9s d\u2019adaptation face au stress et trouve toujours des solutions.  Score compris entre 21 et 26 : adaptation satisfaisante mais inconstante  votre patient c\u2019est faire face au stress en g\xE9n\xE9ral dans la plupart des situations. Cependant, certaines situations sont plus difficiles \xE0 g\xE9rer et entra\xEEnent un sentiment d\u2019impuissance g\xE9n\xE9rateur de troubles \xE9motionnels. La mise en place de strat\xE9gies de gestion du stress est conseill\xE9e.  Score sup\xE9rieur \xE0 27 : niveau \xE9lev\xE9 de stress et d\xE9sadaptation  votre patient per\xE7oit la vie comme mena\xE7ante de fa\xE7on fr\xE9quente ce qui g\xE9n\xE8re un stress. Cette difficult\xE9 d\u2019adaptation face aux \xE9v\xE9nements se caract\xE9rise par un sentiment d\u2019impuissance, une perturbation \xE9motionnelle et affective et constitue un v\xE9ritable facteur de risque de nombreuses maladies cardio m\xE9taboliques, immunitaires, digestives, psychologiques\u2026 il est indispensable de favoriser l\u2019adaptation non seulement par des m\xE9thodes psycho comportementales et \xE9ducatives et des changements de paradigme mais \xE9galement par mode de vie et un mode alimentaire adapt\xE9.`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/stress/questionnaire-echelle-devaluation-bms-burn-out-def-pro.ts
var questionnaire_echelle_devaluation_bms_burn_out_def_pro = {
  metadata: {
    id: "questionnaire-echelle-devaluation-bms-burn-out-def-pro",
    title: `Questionnaire :`,
    category: "stress"
  },
  questions: [
    {
      id: "q2",
      label: `5 \u2013 3.4 Faible`,
      type: "textarea"
    },
    {
      id: "q3",
      label: `5 \u2013 4.4 Mod\xE9r\xE9`,
      type: "textarea"
    },
    {
      id: "q4",
      label: `5 \u2013 5.4 Elev\xE9`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/stress/questionnaire-echelle-devaluation-dass-21-pp-pro.ts
var questionnaire_echelle_devaluation_dass_21_pp_pro = {
  metadata: {
    id: "questionnaire-echelle-devaluation-dass-21-pp-pro",
    title: `Questionnaire :`,
    category: "stress"
  },
  questions: [
    {
      id: "q1",
      label: `J\u2019ai trouv\xE9 difficile de d\xE9compresser.`,
      type: "textarea"
    },
    {
      id: "q2",
      label: `J\u2019ai \xE9t\xE9 conscient(e) d\u2019avoir la bouche s\xE8che.`,
      type: "textarea"
    },
    {
      id: "q3",
      label: `J\u2019ai eu l\u2019impression de ne pas pouvoir ressentir d\u2019\xE9motion positive.`,
      type: "textarea"
    },
    {
      id: "q4",
      label: `J\u2019ai eu de la difficult\xE9 \xE0 respirer (par exemple, respirations excessivement`,
      type: "textarea"
    },
    {
      id: "q5",
      label: `J\u2019ai eu de la difficult\xE9 \xE0 initier de nouvelles activit\xE9s.`,
      type: "textarea"
    },
    {
      id: "q6",
      label: `J\u2019ai eu tendance \xE0 r\xE9agir de fa\xE7on exag\xE9r\xE9e.`,
      type: "textarea"
    },
    {
      id: "q7",
      label: `J\u2019ai eu des tremblements (par exemple, des mains).`,
      type: "textarea"
    },
    {
      id: "q8",
      label: `J\u2019ai eu l\u2019impression de d\xE9penser beaucoup d\u2019\xE9nergie nerveuse.`,
      type: "textarea"
    },
    {
      id: "q9",
      label: `Je me suis inqui\xE9t\xE9(e) en pensant \xE0 des situations o\xF9 je pourrais paniquer et faire`,
      type: "textarea"
    },
    {
      id: "q10",
      label: `J\u2019ai eu le sentiment de ne rien envisager avec plaisir.`,
      type: "textarea"
    },
    {
      id: "q11",
      label: `Je me suis aper\xE7u(e) que je devenais agit\xE9(e).`,
      type: "textarea"
    },
    {
      id: "q12",
      label: `J\u2019ai eu de la difficult\xE9 \xE0 me d\xE9tendre.`,
      type: "textarea"
    },
    {
      id: "q13",
      label: `Je me suis senti(e) triste et d\xE9prim\xE9(e).`,
      type: "textarea"
    },
    {
      id: "q14",
      label: `Je me suis aper\xE7u(e) que je devenais impatient(e) lorsque j\u2019\xE9tais retard\xE9(e) de`,
      type: "textarea"
    },
    {
      id: "q15",
      label: `J\u2019ai eu le sentiment d\u2019\xEAtre presque pris(e) de panique.`,
      type: "textarea"
    },
    {
      id: "q16",
      label: `J\u2019ai \xE9t\xE9 incapable de me sentir enthousiaste au sujet de quoi que ce soit.`,
      type: "textarea"
    },
    {
      id: "q17",
      label: `J'ai eu le sentiment de ne pas valoir grand-chose comme personne.`,
      type: "textarea"
    },
    {
      id: "q18",
      label: `Je me suis aper\xE7u(e) que j\u2019\xE9tais tr\xE8s irritable.`,
      type: "textarea"
    },
    {
      id: "q19",
      label: `J\u2019ai \xE9t\xE9 conscient(e) des palpitations de mon coeur en l\u2019absence d\u2019effort`,
      type: "textarea"
    },
    {
      id: "q20",
      label: `J\u2019ai eu peur sans bonne raison.`,
      type: "textarea"
    },
    {
      id: "q21",
      label: `J\u2019ai eu l\u2019impression que la vie n\u2019avait pas de sens.`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/tabacologie/questionnaire-dependance-au-cannabis-def-pro.ts
var questionnaire_dependance_au_cannabis_def_pro = {
  metadata: {
    id: "questionnaire-dependance-au-cannabis-def-pro",
    title: `Questionnaire :`,
    category: "tabacologie"
  },
  questions: [
    {
      id: "q1",
      label: `A quelle fr\xE9quence fumez-vous du cannabis ?`,
      type: "textarea"
    },
    {
      id: "q2",
      label: `Quelle somme d\xE9pensez-vous en moyenne par semaine pour votre consommation ?`,
      type: "textarea"
    },
    {
      id: "q3",
      label: `A quelle fr\xE9quence \xEAtes-vous en \xE9tat d'ivresse cannabique (\xAB stoned \xBB) ?`,
      type: "textarea"
    },
    {
      id: "q4",
      label: `Lorsque vous fumez un joint, vous arrive-t-il d'en fumer un deuxi\xE8me pour augmenter`,
      type: "textarea"
    },
    {
      id: "q5",
      label: `Vous arrive-t-il de combiner le cannabis avec d'autres drogues ou avec de l'alcool ?`,
      type: "textarea"
    },
    {
      id: "q6",
      label: `A quel moment fumez-vous en g\xE9n\xE9ral (plusieurs r\xE9ponses possibles) ?`,
      type: "textarea"
    },
    {
      id: "q7",
      label: `Quelles sont selon vous les raisons premi\xE8res qui expliquent votre consommation de`,
      type: "textarea"
    },
    {
      id: "q8",
      label: `Avec qui fumez-vous ?`,
      type: "textarea"
    },
    {
      id: "q9",
      label: `Pourriez-vous arr\xEAter de consommer du haschisch ou de l'herbe \xE0 tout moment ?`,
      type: "textarea"
    },
    {
      id: "q10",
      label: `Au cours de l'ann\xE9e \xE9coul\xE9e, combien de fois vous \xEAtes-vous dit : il faudrait que j'arr\xEAte ou`,
      type: "textarea"
    },
    {
      id: "q11",
      label: `Au cours de l'ann\xE9e \xE9coul\xE9e, combien de fois vous est-il arriv\xE9 d'\xEAtre moins efficace au`,
      type: "textarea"
    },
    {
      id: "q12",
      label: `Vous arrive-t-il de reporter des choses parce que vous \xEAtes sous l'effet du cannabis ?`,
      type: "textarea"
    },
    {
      id: "q13",
      label: `Vous est-il arriv\xE9 d'\xEAtre r\xE9ellement contrari\xE9 parce que vous ne pouviez pas fumer de joint`,
      type: "textarea"
    },
    {
      id: "q14",
      label: `Au cours de l'ann\xE9e \xE9coul\xE9e, combien de fois vous \xEAtes-vous inqui\xE9t\xE9 de votre`,
      type: "textarea"
    },
    {
      id: "q15",
      label: `Vous arrive-t-il d'\xE9prouver des difficult\xE9s pour vous rappeler ce que vous avez dit/fait ?`,
      type: "textarea"
    },
    {
      id: "q16",
      label: `Un(e) ami (e) ou une connaissance qui consomme aussi du cannabis a-t-il/elle d\xE9j\xE0`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/tabacologie/questionnaire-di-franza-nicotine-def-pro.ts
var questionnaire_di_franza_nicotine_def_pro = {
  metadata: {
    id: "questionnaire-di-franza-nicotine-def-pro",
    title: `Questionnaire : Test de Di Franza`,
    category: "tabacologie"
  },
  questions: [
    {
      id: "q1",
      label: `As-tu d\xE9j\xE0 essay\xE9 d\u2019arr\xEAter de fumer sans y parvenir ? Cochez`,
      type: "textarea"
    },
    {
      id: "q2",
      label: `Fumes-tu parce qu\u2019il t\u2019est tr\xE8s difficile d\u2019arr\xEAter de fumer ?`,
      type: "textarea"
    },
    {
      id: "q3",
      label: `T\u2019es-tu d\xE9j\xE0 senti accroc \xE0 la cigarette ?`,
      type: "textarea"
    },
    {
      id: "q4",
      label: `As-tu d\xE9j\xE0 eu de tr\xE8s fortes envies incontr\xF4lables de cigarette ?`,
      type: "textarea"
    },
    {
      id: "q5",
      label: `As-tu d\xE9j\xE0 ressenti un fort besoin de cigarette ?`,
      type: "textarea"
    },
    {
      id: "q6",
      label: `Est-ce qu\u2019il t\u2019est difficile de ne pas fumer dans les endroits o\xF9 il est interdit de`,
      type: "textarea"
    },
    {
      id: "q7",
      label: `Trouvais-tu qu\u2019il t\u2019\xE9tait difficile de te concentrer sur quelque chose parce que`,
      type: "textarea"
    },
    {
      id: "q8",
      label: `Te sentais-tu plus irritable parce que tu ne pouvais pas fumer ?`,
      type: "textarea"
    },
    {
      id: "q9",
      label: `Ressentais-tu des envies irr\xE9sistibles et urgentes de fumer ?`,
      type: "textarea"
    },
    {
      id: "q10",
      label: `Te sentais-tu nerveux, agit\xE9 ou anxieux parce que tu ne pouvais pas fumer ?`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/tabacologie/questionnaire-test-dependance-a-la-nicotine-fagerstrom-pro.ts
var questionnaire_test_dependance_a_la_nicotine_fagerstrom_pro = {
  metadata: {
    id: "questionnaire-test-dependance-a-la-nicotine-fagerstrom-pro",
    title: `questionnaire test dependance a la nicotine fagerstrom pro`,
    category: "tabacologie"
  },
  questions: [
    {
      id: "block-01",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Questionnaire  Test de d\xE9pendance \xE0 la nicotine (Fagerstrom)  Combien de temps apr\xE8s votre r\xE9veil fumez-vous votre premi\xE8re cigarette ?  3   Dans les 5 premi\xE8res minutes  2   Entre 6 et 30 minutes  1   Entre 31 et 60 minutes  0   Apr\xE8s 60   minutes  Trouvez-vous difficile de vous abstenir de fumer dans les endroits o\xF9 c\u2019est interdit ?  1   Oui  0   Non  A quelle cigarette de la journ\xE9e vous sera-t-il plus difficile de renoncer ?  1   La premi\xE8re le matin  0   N\u2019importe quelle autre  Combien de cigarettes fumez-vous par jour ?  0   10 au moins  1   11 \xE0 20  2   21 \xE0 30  3   31 ou plus  Fumez - vous \xE0 un rythme plus soutenu le matin que l\u2019apr\xE8s - midi   ?  1   Oui  0   Non  Fumez-vous lorsque vous \xEAtes si malade que vous devez rester au lit presque toute la journ\xE9e ?  1   Oui  0   Non  TOTAL :`,
      type: "textarea"
    },
    {
      id: "block-02",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Interpr\xE9tation des r\xE9sultats  0 \xE0 2 : pas de d\xE9pendance \xE0 la nicotine  3 \xE0 4 : faible d\xE9pendance \xE0 la nicotine  5 \xE0 6 : moyenne d\xE9pendance \xE0 la nicotine  7 \xE0 10 : forte ou tr\xE8s forte d\xE9pendance \xE0 la nicotine.  La d\xE9pendance \xE0 la nicotine n\u2019est que l\u2019un des aspects \xE0 consid\xE9rer dans le sevrage tabagique.  Si la d\xE9pendance physique \xE0 la nicotine est \xE9vidente (Fagerstr\xF6m   >   5), le m\xE9decin doit commencer le sevrage par la prescription de substituts nicotiniques.  D\u2019autres aspects du tabagisme doivent \xEAtre \xE9galement pris en compte notamment la motivation, l\u2019humeur, le niveau de stress, le mode de vie et le mode alimentaire.  L\u2019accompagnement et le coaching sont indispensables pour optimiser les chances de r\xE9ussite d\u2019un sevrage tabagique, pour favoriser le sevrage dans des conditions de bien-\xEAtre et de performance \xE9vitait les cons\xE9quences de l\u2019arr\xEAt du tabac notamment sur le bien de poids excessif.`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/tabacologie/test-motivation-a-larret-du-tabac-lagrue-et-legeron-def-pro.ts
var test_motivation_a_larret_du_tabac_lagrue_et_legeron_def_pro = {
  metadata: {
    id: "test-motivation-a-larret-du-tabac-lagrue-et-legeron-def-pro",
    title: `test motivation a larret du tabac lagrue et legeron def pro`,
    category: "tabacologie"
  },
  questions: [
    {
      id: "block-01",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Questionnaire :  Test de motivation \xE0 l\u2019arr\xEAt du tabac (Lagrue et L\xE9geron)  Score de motivation :  Date  Interpr\xE9tation des r\xE9sultats :  Score entre 0 et 6 :   Le patient est peu ou pas motiv\xE9  Score entre 7 et 12 :   La motivation est pr\xE9sente et n\xE9cessite d\u2019\xEAtre renforc\xE9e  Score entre 13 et 20 :   Le patient poss\xE8de une bonne motivation permettant de d\xE9marrer un sevrage  Score sup\xE9rieur \xE0 20 :   Patient fortement motiv\xE9  Pensez-vous que dans six mois\u2026   Points  Vous fumerez toujours autant   0  Vous aurez diminu\xE9 un peu votre consommation de cigarettes   2  Vous aurez beaucoup diminu\xE9 votre consommation de cigarettes   4  Vous aurez arr\xEAt\xE9 de fumer   8  Avez-vous actuellement envie d\u2019arr\xEAter de fumer ?  Pas du tout   0  Un peu   1  Beaucoup   4  \xC9norm\xE9ment   6  Pensez-vous que dans quatre semaines ?  Vous fumerez toujours autant   0  Vous aurez diminu\xE9 un peu votre consommation de cigarettes   2  Vous aurez beaucoup diminu\xE9 votre consommation de cigarettes   4  Vous aurez arr\xEAt\xE9 de fumer   6  Vous arrive-t-il de ne pas \xEAtre content (e) de fumer ?  Jamais   0  Quelquefois   1  Souvent   2  Tr\xE8s souvent   3  Score de motivation`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/tabacologie/test-qct2-de-gilliard-questionnaire-de-comportement-tabagique-def-pro.ts
var test_qct2_de_gilliard_questionnaire_de_comportement_tabagique_def_pro = {
  metadata: {
    id: "test-qct2-de-gilliard-questionnaire-de-comportement-tabagique-def-pro",
    title: `test qct2 de gilliard questionnaire de comportement tabagique def pro`,
    category: "tabacologie"
  },
  questions: [
    {
      id: "block-01",
      label: `Quand   on   sait,   c\u2019est   plus   facile   d\u2019arr\xEAter  S.I.I.N. -   Scientific Institute for Intelligent Nutrition  Institut Scientifique pour une Nutrition Raisonn\xE9e  Questionnaire de comportement tabagique :  Test QCT2 de Gilliard  Ce questionnaire est destin\xE9 \xE0 \xE9tudier les raisons qui vous incitent actuellement \xE0 fumer. Pour chaque affirmation, nous vous demandons de pr\xE9ciser ce qui correspond \xE0 votre cas. Pour cela inscrivez une croix dans une et une seule des quatre colonnes de droite.  0  Pas du  tout  1  Plut\xF4t  non  2  Plut\xF4t  oui  3  Tout  \xE0 fait  1   - Je fume automatiquement, sans m\xEAme y penser.   D  2   - Je fume pour faire comme les autres.   S  3   - Je fume quand je suis anxieux(se), pr\xE9occup\xE9(e),  inquiet(e).   A  4   - Le plaisir de fumer commence avec les gestes que je fais pour allumer ma cigarette.   H  5   - D\xE8s que je ne fume pas, j\u2019en suis tr\xE8s conscient(e) et je  ne peux pas contr\xF4ler le d\xE9sir de fumer.   D  6   - Je fume quand je suis avec d\u2019autres fumeurs pour me faire accepter par eux.   S  7   - Je fume quand je me sens triste, d\xE9prim\xE9(e).   A  8   - Je prends plaisir \xE0 allumer et \xE0 tenir une cigarette.   H  9   - Quand je n\u2019ai pas pu fumer depuis un moment, j\u2019ai  vraiment une envie irr\xE9sistible d\u2019une cigarette.   D  10   - Je fume pour en imposer aux autres.   S  11   - Fumer me calme, me d\xE9tend, me d\xE9contracte.   A  12   - J\u2019aime manipuler une cigarette.   H  13   - Je prends une cigarette sans savoir pourquoi, sans  m\u2019en rendre compte.   D  14   - Je fume quand je fais une pause.   S  15   - Je fume quand je suis en col\xE8re.   A  16   - Tirer sur une cigarette est relaxant.   H  17   - Je fume par habitude.   D  18   - Je fume pour avoir plus confiance en moi.   S  19   - J\u2019allume une cigarette lorsque je suis tracass\xE9(e).   A`,
      type: "textarea"
    },
    {
      id: "block-02",
      label: `Quand   on   sait,   c\u2019est   plus   facile   d\u2019arr\xEAter  S.I.I.N. -   Scientific Institute for Intelligent Nutrition  Institut Scientifique pour une Nutrition Raisonn\xE9e  20 - J\u2019ai du plaisir \xE0 regarder les volutes de fum\xE9e.   H  21 - Lorsque je n\u2019ai plus de cigarette, il faut absolument que je m\u2019en  procure.   D  22 - Je fume pour me donner une certaine contenance.   S  23 - Je fume chaque fois que je suis mal \xE0 l\u2019aise.   A  24 - Je trouve beaucoup de plaisir dans l\u2019acte de fumer.   H  25 - Je fume dans les moments d\u2019attente.   D  26 - Je fume pour me donner du courage.   S  27 - Je fume quand je me sens seul(e) pour me tenir  compagnie.   A  28 - Quand je me relaxe, j\u2019ai du plaisir \xE0 fumer.   H  R\xC9SULTAT :  Faites la somme des D puis des S, puis des A et enfin des H, vous obtenez 4 totaux sur 21.  D\xC9PENDANCE :   1+5+9+13+17+21+25  DIMENSION SOCIALE :   2+6+10+14+18+22+26  R\xC9GULATION DES AFFECTS N\xC9GATIFS :   3+7+11+15+19+23+27  RECHERCHE DE PLAISIR :   4+8+12+16+20+24+28  D - D\xC9PENDANCE :   TOTAL = . . /21  S - DIMENSION SOCIALE :   TOTAL = . . /21  A - R\xC9GULATION DES AFFECTS N\xC9GATIFS :   TOTAL = . . /21  H - H\xC9DONISME/GESTE :   TOTAL = . . /21  Bibliographie :  Tabac-info-service.fr : Quand on sait, c\u2019est plus facile d\u2019arr\xEAter  GILLIARD J., BRUCHON-SCHWEITZER M. COUSSON-GELIE F.  Construction et validation d\u2019un questionnaire de comportement tabagiques (QCT 2). Psychologie et Psychom\xE9trie, 2000, 21, 4, 77-93.  GILLIARD J., BRUCHON-SCHWEITZER M.  Development and validation of a multidimensional smoking behavior questionnaire : SBQ. Psychological Reports, 2001, 89, 499-509.  GILLIARD J., BRUCHON-SCHWEITZER M.  Les conduites tabagiques et leurs d\xE9terminants. Chap. 10, in : \xAB Les facteurs psychosociaux de la sant\xE9 \xBB. Paris, Dunod, 2001.`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/urologie/catalogue-mictionnel.ts
var catalogue_mictionnel = {
  metadata: {
    id: "catalogue-mictionnel",
    title: `catalogue mictionnel`,
    category: "urologie"
  },
  questions: [
    {
      id: "block-01",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Questionnaire :  Catalogue Mictionnel : CHU de Nice  Il vous a \xE9t\xE9 demand\xE9 de faire un calendrier ou catalogue mictionnel.  Ce recueil de donn\xE9es a pour but d'\xE9tudier le plus pr\xE9cis\xE9ment possible \xAB le fonctionnement de votre vessie \xBB dans votre vie quotidienne et ainsi de mieux comprendre les param\xE8tres en cause de vos troubles urinaires.  Il peut \xE9galement servir \xE0 contr\xF4ler ou surveiller le r\xE9sultat d'un traitement m\xE9dical et/ou chirurgical,  Il ne faut donc pas modifier vos habitudes alimentaires, vos boissons et votre fa\xE7on d'aller aux toilettes.  Pour effectuer ce calendrier mictionnel :   Il vous est demand\xE9 de le faire sur 3 jours (non obligatoirement cons\xE9cutifs)  \u2022   Du premier lever du matin (quand vous commencez votre journ\xE9e)  \u2022   Jusqu\u2019au premier lever du lendemain matin (pendant 24 heures, nuit comprise).  Chaque jour choisi pour ces mesures il faut :  \u2022   Noter l'heure de chaque miction (action d'aller uriner) en commen\xE7ant par la premi\xE8re  miction du matin avec intention de se lever (quand vous commencez votre journ\xE9e).  \u2022   Noter l\u2019heure du LEVER et du COUCHER  \u2022   Mesurer la quantit\xE9 de chaque miction en millilitres \xE0 l'aide d'un verre mesureur  (3 euros dans le commerce)  Faire l'addition de ces quantit\xE9s mesur\xE9es par jour (pour obtenir la quantit\xE9 d'urine par 24h).  Signaler dans la case \xAB Fuites \xBB :  \u2022   la survenue de fuites et leur importance (+, ++ ou +++),  \u2022   les circonstances de survenue de ces fuites   (T = toux, M = marche, U=Urgenturie, Ins = insensible, etc).  Signaler dans la case \xAB Urgence \xBB  \u2022   la survenue des Urgences et leur importance (+, ++ ou +++),  Signaler \xE9galement tout autre sympt\xF4me remarquable. Nous vous remercions de suivre attentivement ces conseils pour la r\xE9alisation la plus pr\xE9cise de votre catalogue mictionnel.`,
      type: "textarea"
    },
    {
      id: "block-02",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Jour 1   Date :  Heure   Volume urin\xE9  (en ml)  Si fuite  (+ \xE0 +++)  Si urgence  (+ \xE0 +++)  Si douleurs  (1 \xE0 10)  Total du nombre de  mictions :  Volume total :   Total nombre  de fuites :  Total nombre  d\u2019urgences :`,
      type: "textarea"
    },
    {
      id: "block-03",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Jour 2   Date :  Heure   Volume urin\xE9  (en ml)  Si fuite  (+ \xE0 +++)  Si urgence  (+ \xE0 +++)  Si douleurs  (1 \xE0 10)  Total du nombre de  mictions :  Volume total :   Total nombre  de fuites :  Total nombre  d\u2019urgences :`,
      type: "textarea"
    },
    {
      id: "block-04",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Jour 3   Date :  Heure   Volume urin\xE9  (en ml)  Si fuite  (+ \xE0 +++)  Si urgence  (+ \xE0 +++)  Si douleurs  (1 \xE0 10)  Total du nombre de  mictions :  Volume total :   Total nombre  de fuites :  Total nombre  d\u2019urgences :`,
      type: "textarea"
    }
  ]
};

// src/questionnaires/urologie/ipss-international-prostate-score-symptom-pro.ts
var ipss_international_prostate_score_symptom_pro = {
  metadata: {
    id: "ipss-international-prostate-score-symptom-pro",
    title: `ipss international prostate score symptom pro`,
    category: "urologie"
  },
  questions: [
    {
      id: "block-01",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  Questionnaire :  IPSS : International Prostate Score Symptom  Nom :   Pr\xE9nom :   Date :  Jamais   Environ  1 x / 5  Environ  1 x / 3  Environ  1 x / 2  Environ  2 x / 3  Presque  toujours  Au cours du dernier mois, avec quelle  fr\xE9quence avez-vous eu la sensation que votre vessie n'\xE9tait pas compl\xE8tement vid\xE9e apr\xE8s avoir urin\xE9 ?  0   1   2   3   4   5  Au cours du dernier mois, avec quelle  fr\xE9quence avez-vous eu besoin d'uriner  moins de 2 heures apr\xE8s avoir fini  d'uriner ?  0   2   3   4   5   6  Au cours du dernier mois, avec quelle fr\xE9quence avez-vous eu une interruption du jet d'urine c'est \xE0 dire d\xE9marrage de la miction puis arr\xEAt puis red\xE9marrage ?  0   1   2   3   4   5  Au cours du dernier mois, apr\xE8s avoir  ressenti le besoin d'uriner, avec quelle  fr\xE9quence avez-vous eu des difficult\xE9s  \xE0 vous retenir d'uriner ?  0   1   2   3   4   5  Au cours du dernier mois, avec quelle fr\xE9quence avez-vous eu une diminution de la taille ou de la force du jet d'urine ?  0   1   2   3   4   5  Au cours du dernier mois, avec quelle  fr\xE9quence avez-vous d\xFB forcer ou  pousser pour commencer \xE0 uriner ?  0   1   2   3   4   5  Jamais   1 fois   2 fois   3 fois   4 fois   5 fois  Au cours du dernier mois \xE9coul\xE9,  combien de fois par nuit, en moyenne,  vous \xEAtes-vous lev\xE9 pour uriner (entre  le moment de votre coucher le soir et  celui de votre lever d\xE9finitif le matin ?  0   1   2   3   4   5  Total = IPSS`,
      type: "textarea"
    },
    {
      id: "block-02",
      label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonn\xE9e  \u2022   0 \u2013 7 = l\xE9ger  \u2022   8 \u2013 19 = mod\xE9r\xE9  \u2022   20 \u2013 35 = s\xE9v\xE8re  Evaluation de la qualit\xE9 de vie li\xE9e aux sympt\xF4mes urinaires  Tr\xE8s  satisfait  Satisfait   Plut\xF4t  satisfait  Partag\xE9 (ni  satisfait, ni  ennuy\xE9)  Plut\xF4t  ennuy\xE9  Ennuy\xE9   Tr\xE8s  ennuy\xE9  Si vous deviez vivre le restant de votre vie avec cette mani\xE8re d'uriner, diriez-vous que vous en seriez :  0   1   2   3   4   5   6`,
      type: "textarea"
    }
  ]
};

// src/index.ts
function getAllQuestionnaires() {
  return [
    evaluation_des_apports_caloriques_et_proteiques_alimentaires_selon_le_pr_l_monnier_def_patient,
    monnier_def_pro,
    questionnaire_alimentaire_de_diete_mediterraneenne_def,
    questionnaire_alimentaire_siin_def_pro,
    questionnaire_cancero_qlq_br23_def_pro,
    questionnaire_cancero_qlq_c30_def_pro,
    questionnaire_troubles_fonctionnels_cardio_metabolique_def_pro,
    questionnaire_de_bristol_pro_def,
    questionnaire_troubles_fonctionnels_digestifs_et_intestinaux_def_my_et_pro,
    score_de_francis_des_troubles_fonctionnels_intestinaux_def_pro,
    questionnaire_sarcopenie_pro,
    tinetti,
    mes_plaintes_actuelles_et_troubles_ressentis,
    questionnaire_contextuel_mode_de_vie_pro_def,
    questionnaire_dactivite_et_de_depense_energetique_globale_siin_def_pro,
    auto_anxiete_def_pro,
    bdi_echelle_de_depression_de_beck_def_pro,
    dependance_a_internet_def_pro,
    echelle_ecab_def_pro,
    grille_de_zarit_mesure_de_la_charge_des_proches_aidants_def_pro,
    hamilton_def_pro,
    hit_de_patients_migraineux_def_pro,
    hypersensibilite_au_deficit_en_magnesium_def_pro,
    idtas_ae_auto_eval_depression_trouble_affectif_saisonnier_def_pro,
    madrs_echelle_de_depression_def_pro,
    maladie_dalzheimer_def_pro,
    mini_mental_state_examination_mmse_def_pro,
    questionnaire_audit_alcool_def_pro,
    questionnaire_de_dependance_a_un_medicament_def_pro,
    questionnaire_de_scoff_def_pro,
    questionnaire_dopamine_noradrenaline_serotonine_melatonine_def_my_et_pro,
    questionnaire_fonctionnel_dhyperexcitabilite_def_pro,
    questionnaire_reperage_des_troubles_dementiels_def_pro,
    questionnaire_test_des_5_mots_def_pro,
    questionnaire_the_work_addiction_risk_test_wart_def_pro,
    test_echelle_had_def_my_et_pro,
    upps_impulsivite_def_pro,
    conners_enseignant_version2_courte,
    echelle_de_conners_tdah_interpretation,
    echelle_de_matinalite_vesperalite_pour_l_enfant_def_pro,
    questionnaire_bpco_def_pro,
    first_def_pro,
    mesure_de_limpact_de_la_fibromyalgie_def_pro,
    echelle_de_somnolence_depsworth_my_et_pro_ok,
    echelle_multidimensionnelle_de_fatigue_pro_def,
    echelle_syndrome_des_jambes_sans_repos_irls_def_pro,
    questionnaire_agenda_du_sommeil_def,
    questionnaire_chronotype_de_horn_def_my_et_pro,
    questionnaire_de_berlin_apnee_du_sommeil_def_pro,
    questionnaire_de_fatigue_de_pichot_pro_def,
    questionnaire_du_sommeil_psqi_def_my_et_pro,
    questionnaire_de_karasek_def_pro,
    questionnaire_de_stress_de_cungi_def_pro,
    questionnaire_de_stress_siin_def_pro,
    questionnaire_echelle_de_stress_de_cohen_pss_pro,
    questionnaire_echelle_devaluation_bms_burn_out_def_pro,
    questionnaire_echelle_devaluation_dass_21_pp_pro,
    questionnaire_dependance_au_cannabis_def_pro,
    questionnaire_di_franza_nicotine_def_pro,
    questionnaire_test_dependance_a_la_nicotine_fagerstrom_pro,
    test_motivation_a_larret_du_tabac_lagrue_et_legeron_def_pro,
    test_qct2_de_gilliard_questionnaire_de_comportement_tabagique_def_pro,
    catalogue_mictionnel,
    ipss_international_prostate_score_symptom_pro
  ];
}
function getQuestionnaireById(id) {
  return getAllQuestionnaires().find((q) => q.metadata.id === id);
}
function getQuestionnairesByCategory(category) {
  return getAllQuestionnaires().filter((q) => q.metadata.category === category);
}
export {
  NEUROTRANSMITTER_THEMES,
  auto_anxiete_def_pro,
  bdi_echelle_de_depression_de_beck_def_pro,
  catalogue_mictionnel,
  conners_enseignant_version2_courte,
  dependance_a_internet_def_pro,
  echelle_de_conners_tdah_interpretation,
  echelle_de_matinalite_vesperalite_pour_l_enfant_def_pro,
  echelle_de_somnolence_depsworth_my_et_pro_ok,
  echelle_ecab_def_pro,
  echelle_multidimensionnelle_de_fatigue_pro_def,
  echelle_syndrome_des_jambes_sans_repos_irls_def_pro,
  evaluation_des_apports_caloriques_et_proteiques_alimentaires_selon_le_pr_l_monnier_def_patient,
  first_def_pro,
  getAllQuestionnaires,
  getQuestionnaireById,
  getQuestionnairesByCategory,
  grille_de_zarit_mesure_de_la_charge_des_proches_aidants_def_pro,
  hamilton_def_pro,
  hit_de_patients_migraineux_def_pro,
  hypersensibilite_au_deficit_en_magnesium_def_pro,
  idtas_ae_auto_eval_depression_trouble_affectif_saisonnier_def_pro,
  ipss_international_prostate_score_symptom_pro,
  madrs_echelle_de_depression_def_pro,
  maladie_dalzheimer_def_pro,
  mes_plaintes_actuelles_et_troubles_ressentis,
  mesure_de_limpact_de_la_fibromyalgie_def_pro,
  mini_mental_state_examination_mmse_def_pro,
  monnier_def_pro,
  questionnaire_agenda_du_sommeil_def,
  questionnaire_alimentaire_de_diete_mediterraneenne_def,
  questionnaire_alimentaire_siin_def_pro,
  questionnaire_audit_alcool_def_pro,
  questionnaire_bpco_def_pro,
  questionnaire_cancero_qlq_br23_def_pro,
  questionnaire_cancero_qlq_c30_def_pro,
  questionnaire_chronotype_de_horn_def_my_et_pro,
  questionnaire_contextuel_mode_de_vie_pro_def,
  questionnaire_dactivite_et_de_depense_energetique_globale_siin_def_pro,
  questionnaire_de_berlin_apnee_du_sommeil_def_pro,
  questionnaire_de_bristol_pro_def,
  questionnaire_de_dependance_a_un_medicament_def_pro,
  questionnaire_de_fatigue_de_pichot_pro_def,
  questionnaire_de_karasek_def_pro,
  questionnaire_de_scoff_def_pro,
  questionnaire_de_stress_de_cungi_def_pro,
  questionnaire_de_stress_siin_def_pro,
  questionnaire_dependance_au_cannabis_def_pro,
  questionnaire_di_franza_nicotine_def_pro,
  questionnaire_dopamine_noradrenaline_serotonine_melatonine_def_my_et_pro,
  questionnaire_du_sommeil_psqi_def_my_et_pro,
  questionnaire_echelle_de_stress_de_cohen_pss_pro,
  questionnaire_echelle_devaluation_bms_burn_out_def_pro,
  questionnaire_echelle_devaluation_dass_21_pp_pro,
  questionnaire_fonctionnel_dhyperexcitabilite_def_pro,
  questionnaire_reperage_des_troubles_dementiels_def_pro,
  questionnaire_sarcopenie_pro,
  questionnaire_test_dependance_a_la_nicotine_fagerstrom_pro,
  questionnaire_test_des_5_mots_def_pro,
  questionnaire_the_work_addiction_risk_test_wart_def_pro,
  questionnaire_troubles_fonctionnels_cardio_metabolique_def_pro,
  questionnaire_troubles_fonctionnels_digestifs_et_intestinaux_def_my_et_pro,
  score_de_francis_des_troubles_fonctionnels_intestinaux_def_pro,
  test_echelle_had_def_my_et_pro,
  test_motivation_a_larret_du_tabac_lagrue_et_legeron_def_pro,
  test_qct2_de_gilliard_questionnaire_de_comportement_tabagique_def_pro,
  tinetti,
  upps_impulsivite_def_pro
};
