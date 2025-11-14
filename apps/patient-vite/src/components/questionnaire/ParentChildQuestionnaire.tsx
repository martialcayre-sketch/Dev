/**
 * NeuroNutrition - Mode Parent/Enfant pour Questionnaires Kids
 *
 * Interface spécialisée pour accompagner les enfants dans le remplissage
 * avec aide des parents (conformément aux spécifications)
 */

import type { AgeVariant, Question } from '@neuronutrition/shared-questionnaires';
import { Heart, HelpCircle, MessageCircle, Star } from 'lucide-react';
import { useState } from 'react';

// Composants UI temporaires
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg border shadow-sm ${className}`}>{children}</div>
);

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="p-6 pb-2">{children}</div>
);

const CardContent = ({ children }: { children: React.ReactNode }) => (
  <div className="p-6 pt-0">{children}</div>
);

const Button = ({
  children,
  onClick,
  variant = 'default',
  size = 'default',
  disabled = false,
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: string;
  size?: string;
  disabled?: boolean;
  className?: string;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded-md font-medium transition-colors ${
      variant === 'outline'
        ? 'border border-gray-300 bg-white hover:bg-gray-50'
        : 'bg-blue-600 text-white hover:bg-blue-700'
    } ${size === 'lg' ? 'px-6 py-3 text-lg' : ''} ${size === 'sm' ? 'px-3 py-1 text-sm' : ''} ${
      disabled ? 'opacity-50 cursor-not-allowed' : ''
    } ${className}`}
  >
    {children}
  </button>
);

const Badge = ({
  children,
  variant = 'default',
  className = '',
}: {
  children: React.ReactNode;
  variant?: string;
  className?: string;
}) => (
  <span
    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
      variant === 'outline'
        ? 'border border-gray-300 text-gray-700'
        : variant === 'secondary'
        ? 'bg-gray-100 text-gray-800'
        : 'bg-blue-100 text-blue-800'
    } ${className}`}
  >
    {children}
  </span>
);

const Progress = ({ value, className = '' }: { value: number; className?: string }) => (
  <div className={`bg-gray-200 rounded-full ${className}`}>
    <div
      className="bg-blue-600 h-full rounded-full transition-all duration-300"
      style={{ width: `${value}%` }}
    />
  </div>
);
interface ParentChildQuestionnaireProps {
  questions: Question[];
  responses: Record<string, string | number>;
  onResponseChange: (questionId: string, value: string | number) => void;
  onSubmit: () => void;
  ageVariant: AgeVariant;
  patientAge: number;
  isSubmitting?: boolean;
}

interface ParentAssistanceMode {
  isActive: boolean;
  parentHelping: boolean;
  childUnderstands: boolean;
}

export function ParentChildQuestionnaire({
  questions,
  responses,
  onResponseChange,
  onSubmit,
  ageVariant,
  isSubmitting = false,
}: Omit<ParentChildQuestionnaireProps, 'patientAge'>) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [parentMode, setParentMode] = useState<ParentAssistanceMode>({
    isActive: ageVariant === 'kid',
    parentHelping: false,
    childUnderstands: true,
  });
  const [encouragementShown, setEncouragementShown] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  // Messages d'encouragement adaptés à l'âge
  const getEncouragementMessage = () => {
    const messages = {
      kid: [
        'Super ! Tu réponds très bien !',
        'Bravo ! Continue comme ça !',
        'Tu es formidable !',
        'Excellent travail !',
        'Tu y arrives très bien !',
      ],
      teen: [
        'Très bien ! Continue !',
        'Tu gères parfaitement !',
        'Super boulot !',
        "Parfait ! Plus qu'un peu !",
      ],
      adult: ['Très bien, continuez !'],
    };

    const ageMessages = messages[ageVariant] || messages.adult;
    return ageMessages[Math.floor(Math.random() * ageMessages.length)];
  };

  // Gestion des réponses avec encouragement
  const handleResponseChange = (value: string | number) => {
    onResponseChange(currentQuestion.id, value);

    // Encouragement aléatoire pour les enfants
    if (ageVariant === 'kid' && Math.random() < 0.3) {
      setEncouragementShown(true);
      setTimeout(() => setEncouragementShown(false), 2000);
    }
  };

  // Navigation entre questions
  const handleNext = () => {
    if (isLastQuestion) {
      onSubmit();
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  // Basculer mode assistance parent
  const toggleParentAssistance = () => {
    setParentMode((prev) => ({
      ...prev,
      parentHelping: !prev.parentHelping,
    }));
  };

  // Rendu des contrôles de réponse selon le type
  const renderQuestionInput = (
    question: Question,
    value: string | number,
    onChange: (value: string | number) => void
  ) => {
    const isKid = ageVariant === 'kid';

    // Questions à échelle
    if (question.scale && question.scaleType) {
      const maxValue = question.scaleType === '0-4' ? 4 : question.scaleType === '0-10' ? 10 : 5;

      return (
        <div className="space-y-4">
          {isKid && (
            <p className="text-center text-lg font-medium text-gray-700">
              {question.minLabel || 'Pas du tout'} ← → {question.maxLabel || 'Beaucoup'}
            </p>
          )}

          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: maxValue + 1 }, (_, i) => (
              <Button
                key={i}
                variant={value === i ? 'default' : 'outline'}
                size={isKid ? 'lg' : 'default'}
                onClick={() => onChange(i)}
                className={`${isKid ? 'text-lg h-12' : ''} relative`}
              >
                {i}
              </Button>
            ))}
          </div>
        </div>
      );
    }

    // Questions texte libre
    if (question.type === 'textarea') {
      return (
        <textarea
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          placeholder={isKid ? 'Écris ici avec papa ou maman...' : 'Votre réponse...'}
          rows={isKid ? 4 : 6}
          className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${
            isKid ? 'text-lg' : 'text-base'
          }`}
        />
      );
    }

    // Questions numériques
    if (question.type === 'number') {
      return (
        <input
          type="number"
          value={value as number}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 ${
            isKid ? 'text-lg text-center' : 'text-base'
          }`}
          placeholder={isKid ? 'Écris un chiffre' : 'Entrez un nombre'}
        />
      );
    }

    // Questions à choix multiple
    if (question.options) {
      return (
        <div className="space-y-2">
          {question.options.map((option, index) => {
            const optionValue = typeof option === 'string' ? option : option.value;
            const optionLabel = typeof option === 'string' ? option : option.label;

            return (
              <Button
                key={index}
                variant={value === optionValue ? 'default' : 'outline'}
                size={isKid ? 'lg' : 'default'}
                onClick={() => onChange(optionValue)}
                className={`w-full justify-start ${isKid ? 'text-lg h-14 text-left' : 'h-12'}`}
              >
                {value === optionValue && (
                  <Star size={isKid ? 20 : 16} className="mr-2 text-yellow-400 fill-current" />
                )}
                {optionLabel}
              </Button>
            );
          })}
        </div>
      );
    }

    return null;
  };

  // Rendu de la question selon l'âge et le type
  const renderQuestion = () => {
    if (!currentQuestion) return null;

    const isKid = ageVariant === 'kid';
    const currentValue = responses[currentQuestion.id] || '';

    return (
      <Card
        className={`transition-all duration-300 ${
          isKid
            ? 'border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50'
            : ageVariant === 'teen'
            ? 'border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-purple-50'
            : 'border-gray-200'
        }`}
      >
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3
                className={`font-medium ${
                  isKid
                    ? 'text-xl text-orange-800'
                    : ageVariant === 'teen'
                    ? 'text-lg text-blue-800'
                    : 'text-lg text-gray-800'
                }`}
              >
                {isKid ? '🌟 ' : ageVariant === 'teen' ? '💫 ' : ''}
                Question {currentQuestionIndex + 1}
              </h3>

              <p
                className={`mt-2 ${
                  isKid
                    ? 'text-lg leading-relaxed text-gray-800'
                    : ageVariant === 'teen'
                    ? 'text-base text-gray-700'
                    : 'text-base text-gray-600'
                }`}
              >
                {currentQuestion.label}
              </p>

              {currentQuestion.helpText && (
                <div
                  className={`mt-3 p-3 rounded-lg ${
                    isKid
                      ? 'bg-yellow-100 border-l-4 border-yellow-400'
                      : ageVariant === 'teen'
                      ? 'bg-blue-100 border-l-4 border-blue-400'
                      : 'bg-gray-100 border-l-4 border-gray-400'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <HelpCircle
                      size={16}
                      className={isKid ? 'text-yellow-600 mt-0.5' : 'text-blue-600 mt-0.5'}
                    />
                    <p className="text-sm">{currentQuestion.helpText}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Badge variant={isKid ? 'default' : 'secondary'}>
                {currentQuestionIndex + 1} / {questions.length}
              </Badge>
              {isKid && parentMode.parentHelping && (
                <Badge variant="outline" className="text-purple-600">
                  👨‍👩‍👧‍👦 Avec papa/maman
                </Badge>
              )}
            </div>
          </div>

          <div className="mt-4">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-gray-500 mt-1">
              {isKid
                ? `🎈 Tu as répondu à ${currentQuestionIndex + 1} questions sur ${
                    questions.length
                  } !`
                : ageVariant === 'teen'
                ? `${Math.round(progress)}% terminé`
                : `${currentQuestionIndex + 1} sur ${questions.length} questions`}
            </p>
          </div>
        </CardHeader>

        <CardContent>
          {renderQuestionInput(currentQuestion, currentValue, handleResponseChange)}

          {isKid && (
            <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageCircle size={20} className="text-purple-600" />
                  <div>
                    <h4 className="font-medium text-purple-800">Aide des parents</h4>
                    <p className="text-sm text-purple-600">
                      {parentMode.parentHelping
                        ? "Papa ou maman m'aide à répondre"
                        : 'Je réponds tout seul(e)'}
                    </p>
                  </div>
                </div>
                <Button
                  variant={parentMode.parentHelping ? 'default' : 'outline'}
                  size="sm"
                  onClick={toggleParentAssistance}
                >
                  {parentMode.parentHelping ? '✅ Avec aide' : "👋 Demander de l'aide"}
                </Button>
              </div>
            </div>
          )}

          {encouragementShown && (
            <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg text-center animate-bounce">
              <p className="text-green-800 font-medium">{getEncouragementMessage()}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* En-tête adapté à l'âge */}
      <div
        className={`text-center p-6 rounded-lg ${
          ageVariant === 'kid'
            ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white'
            : ageVariant === 'teen'
            ? 'bg-gradient-to-r from-blue-400 to-purple-400 text-white'
            : 'bg-gradient-to-r from-gray-400 to-gray-600 text-white'
        }`}
      >
        <h1 className="text-2xl font-bold">
          {ageVariant === 'kid'
            ? '🌟 Questionnaire pour toi !'
            : ageVariant === 'teen'
            ? '💫 Ton questionnaire'
            : 'Questionnaire'}
        </h1>
        {ageVariant === 'kid' && (
          <p className="mt-2 text-lg opacity-90">👨‍👩‍👧‍👦 Papa ou maman peuvent t'aider à répondre !</p>
        )}
      </div>

      {/* Question actuelle */}
      {renderQuestion()}

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          size={ageVariant === 'kid' ? 'lg' : 'default'}
        >
          ← {ageVariant === 'kid' ? "Question d'avant" : 'Précédent'}
        </Button>

        <div className="flex items-center gap-2">
          {ageVariant === 'kid' && <Heart size={20} className="text-red-400 animate-pulse" />}
          <span className="text-sm text-gray-600">
            {ageVariant === 'kid'
              ? '🌈 Tu y arrives super bien !'
              : ageVariant === 'teen'
              ? '💪 Continue comme ça !'
              : 'Continuez'}
          </span>
        </div>

        <Button
          onClick={handleNext}
          disabled={!responses[currentQuestion?.id] || isSubmitting}
          size={ageVariant === 'kid' ? 'lg' : 'default'}
          className={ageVariant === 'kid' ? 'text-lg px-8' : ''}
        >
          {isSubmitting && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          )}
          {isLastQuestion
            ? ageVariant === 'kid'
              ? '🎉 Terminer !'
              : 'Terminer'
            : ageVariant === 'kid'
            ? 'Question suivante →'
            : 'Suivant →'}
        </Button>
      </div>
    </div>
  );
}
