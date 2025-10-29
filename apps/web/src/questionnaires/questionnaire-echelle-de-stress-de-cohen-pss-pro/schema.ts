export type QOption = { value: number; label: string }
export type QField = { type: 'radio'; id: string; label: string; options: QOption[] }
export type QSchema = { id: string; title: string; fields: QField[] }

const opt = (labels: string[], values: number[]) => labels.map((l, i) => ({ label: l, value: values[i] }))

export const schema: QSchema = {
  id: 'questionnaire-echelle-de-stress-de-cohen-pss-pro',
  title: 'Échelle de stress de Cohen (PSS-10)',
  fields: [
    { type: 'radio', id: 'q1', label: 'Au cours du dernier mois, combien de fois avez-vous été dérangé(e) par un évènement inattendu ?', options: opt(['Jamais','Presque jamais','Parfois','Assez souvent','Souvent'], [1,2,3,4,5]) },
    { type: 'radio', id: 'q2', label: '... difficile de contrôler les choses importantes de votre vie ?', options: opt(['Jamais','Presque jamais','Parfois','Assez souvent','Souvent'], [1,2,3,4,5]) },
    { type: 'radio', id: 'q3', label: '... vous êtes-vous senti(e) nerveux(se) ou stressé(e) ?', options: opt(['Jamais','Presque jamais','Parfois','Assez souvent','Souvent'], [1,2,3,4,5]) },
    { type: 'radio', id: 'q4', label: '... vous êtes-vous senti(e) confiant(e) pour prendre en main vos problèmes personnels ?', options: opt(['Jamais','Presque jamais','Parfois','Assez souvent','Souvent'], [5,4,3,2,1]) },
    { type: 'radio', id: 'q5', label: '... avez-vous senti que les choses allaient comme vous le vouliez ?', options: opt(['Jamais','Presque jamais','Parfois','Assez souvent','Souvent'], [5,4,3,2,1]) },
    { type: 'radio', id: 'q6', label: '... avez-vous pensé ne pas pouvoir assumer toutes les choses à faire ?', options: opt(['Jamais','Presque jamais','Parfois','Assez souvent','Souvent'], [1,2,3,4,5]) },
    { type: 'radio', id: 'q7', label: '... avez-vous été capable de maîtriser votre énervement ?', options: opt(['Jamais','Presque jamais','Parfois','Assez souvent','Souvent'], [5,4,3,2,1]) },
    { type: 'radio', id: 'q8', label: '... avez-vous senti que vous dominiez la situation ?', options: opt(['Jamais','Presque jamais','Parfois','Assez souvent','Souvent'], [5,4,3,2,1]) },
    { type: 'radio', id: 'q9', label: '... vous êtes-vous senti(e) irrité(e) parce que des évènements échappaient à votre contrôle ?', options: opt(['Jamais','Presque jamais','Parfois','Assez souvent','Souvent'], [1,2,3,4,5]) },
    { type: 'radio', id: 'q10', label: '... avez-vous trouvé que les difficultés s’accumulaient au point de ne plus pouvoir les contrôler ?', options: opt(['Jamais','Presque jamais','Parfois','Assez souvent','Souvent'], [1,2,3,4,5]) },
  ],
}

