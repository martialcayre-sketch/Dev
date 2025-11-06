import {
  getAllQuestionnaires,
  getQuestionnairesByCategory,
  type MedicalCategory,
  type Questionnaire,
} from '@neuronutrition/shared-questionnaires';
import { ArrowLeft, Clock, FileText, Tag } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export function QuestionnairesLibrary() {
  const [selectedCategory, setSelectedCategory] = useState<MedicalCategory | 'all'>('all');
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionnaire | null>(null);

  const allQuestionnaires = getAllQuestionnaires();
  const categories = Array.from(new Set(allQuestionnaires.map((q) => q.metadata.category)));

  const displayedQuestionnaires =
    selectedCategory === 'all' ? allQuestionnaires : getQuestionnairesByCategory(selectedCategory);

  if (selectedQuestionnaire) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setSelectedQuestionnaire(null)}
            className="flex items-center gap-2 text-emerald-700 hover:text-emerald-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour à la bibliothèque
          </button>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {selectedQuestionnaire.metadata.title}
              </h1>
              {selectedQuestionnaire.metadata.description && (
                <p className="text-gray-600">{selectedQuestionnaire.metadata.description}</p>
              )}
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
                {selectedQuestionnaire.metadata.estimatedDuration && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {selectedQuestionnaire.metadata.estimatedDuration} min
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  {selectedQuestionnaire.metadata.category}
                </div>
              </div>
            </div>

            {/* Sections */}
            {selectedQuestionnaire.sections && selectedQuestionnaire.sections.length > 0 ? (
              <div className="space-y-6">
                {selectedQuestionnaire.sections.map((section, idx) => (
                  <div key={section.id} className="border-t border-gray-200 pt-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      {idx + 1}. {section.title}
                    </h2>
                    {section.description && (
                      <p className="text-gray-600 mb-4">{section.description}</p>
                    )}
                    <div className="space-y-4">
                      {section.questions.map((question, qIdx) => (
                        <div key={question.id} className="bg-gray-50 rounded-lg p-4">
                          <p className="font-medium text-gray-900 mb-2">
                            {idx + 1}.{qIdx + 1}. {question.label}
                          </p>
                          {question.options && (
                            <ul className="space-y-1 ml-4">
                              {question.options.map((option, oIdx) => (
                                <li key={oIdx} className="text-sm text-gray-600">
                                  • {typeof option === 'string' ? option : option.label}{' '}
                                  {typeof option !== 'string' &&
                                    option.points !== undefined &&
                                    `(${option.points} pts)`}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Questions directes */
              <div className="space-y-4">
                {selectedQuestionnaire.questions?.map((question, qIdx) => (
                  <div key={question.id} className="bg-gray-50 rounded-lg p-4">
                    <p className="font-medium text-gray-900 mb-2">
                      {qIdx + 1}. {question.label}
                    </p>
                    {question.options && (
                      <ul className="space-y-1 ml-4">
                        {question.options.map((option, oIdx) => (
                          <li key={oIdx} className="text-sm text-gray-600">
                            • {typeof option === 'string' ? option : option.label}{' '}
                            {typeof option !== 'string' &&
                              option.points !== undefined &&
                              `(${option.points} pts)`}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link
            to="/"
            className="flex items-center gap-2 text-emerald-700 hover:text-emerald-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour au tableau de bord
          </Link>

          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📚 Bibliothèque de Questionnaires
          </h1>
          <p className="text-gray-600">{allQuestionnaires.length} questionnaires disponibles</p>
        </div>

        {/* Filtres par catégorie */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Catégories</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tous ({allQuestionnaires.length})
            </button>
            {categories.sort().map((category) => {
              const count = getQuestionnairesByCategory(category).length;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category as MedicalCategory)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === category
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Grille de questionnaires */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedQuestionnaires.map((questionnaire) => {
            const questionCount = questionnaire.sections
              ? questionnaire.sections.reduce((acc, section) => acc + section.questions.length, 0)
              : questionnaire.questions?.length || 0;

            return (
              <button
                key={questionnaire.metadata.id}
                onClick={() => setSelectedQuestionnaire(questionnaire)}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all hover:scale-105 text-left"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-3 bg-emerald-100 rounded-lg">
                    <FileText className="w-6 h-6 text-emerald-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                      {questionnaire.metadata.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Tag className="w-3 h-3" />
                      {questionnaire.metadata.category}
                    </div>
                  </div>
                </div>

                {questionnaire.metadata.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {questionnaire.metadata.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-500">
                    <FileText className="w-4 h-4" />
                    {questionCount} questions
                  </div>
                  {questionnaire.metadata.estimatedDuration && (
                    <div className="flex items-center gap-2 text-gray-500">
                      <Clock className="w-4 h-4" />
                      {questionnaire.metadata.estimatedDuration} min
                    </div>
                  )}
                </div>

                {questionnaire.metadata.tags && questionnaire.metadata.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {questionnaire.metadata.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {displayedQuestionnaires.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun questionnaire trouvé</h3>
            <p className="text-gray-600">Essayez de sélectionner une autre catégorie</p>
          </div>
        )}
      </div>
    </div>
  );
}
