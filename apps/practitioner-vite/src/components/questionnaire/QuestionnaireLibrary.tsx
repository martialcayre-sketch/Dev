/**
 * NeuroNutrition - Interface Bibliothèque Questionnaires (Praticien)
 *
 * Interface React pour sélection et assignation de questionnaires
 */

import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import type { AgeVariant } from '@neuronutrition/shared-questionnaires';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { CheckCircle, Filter, Search, Tag, User } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

// Composants UI simples et fonctionnels
const Badge = ({
  children,
  variant = 'default',
  className = '',
}: {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'secondary';
  className?: string;
}) => (
  <span
    className={`px-2 py-1 text-xs rounded ${
      variant === 'outline'
        ? 'border border-gray-300 text-gray-700'
        : variant === 'secondary'
        ? 'bg-gray-200 text-gray-800'
        : 'bg-blue-100 text-blue-800'
    } ${className}`}
  >
    {children}
  </span>
);

const Button = ({
  children,
  onClick,
  disabled,
  variant = 'primary',
  size = 'md',
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) => {
  const baseClass = 'rounded transition-colors font-medium';
  const sizeClass = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  }[size];
  const variantClass = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
  }[variant];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} ${sizeClass} ${variantClass} ${className}`}
    >
      {children}
    </button>
  );
};

const Card = ({
  children,
  className = '',
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) => (
  <div
    className={`bg-white border border-gray-200 rounded-lg shadow ${
      onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
    } ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
);

const CardContent = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`p-6 ${className}`}>{children}</div>;

const CardHeader = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`p-6 pb-0 ${className}`}>{children}</div>;

const Checkbox = ({
  checked,
  onCheckedChange,
  id,
  readOnly = false,
}: {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  id?: string;
  readOnly?: boolean;
}) => (
  <input
    type="checkbox"
    id={id}
    checked={checked}
    onChange={(e) => !readOnly && onCheckedChange?.(e.target.checked)}
    disabled={readOnly}
    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
  />
);

// Toast notification simple
const toast = {
  success: (message: string) => console.log('✅', message),
  error: (message: string) => console.error('❌', message),
};

interface QuestionnaireTemplate {
  id: string;
  title: string;
  category: string;
  estimatedTime: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  availableVariants: AgeVariant[];
  description?: string;
  tags?: string[];
}

interface LibraryData {
  templates: QuestionnaireTemplate[];
  categories: Record<string, QuestionnaireTemplate[]>;
  stats: {
    totalTemplates: number;
    totalVariants: number;
    categoriesCount: number;
    categories: string[];
  };
}

interface QuestionnaireLibraryProps {
  patientUid: string;
  patientAge?: number;
  ageVariant?: AgeVariant;
  onAssignmentSuccess?: (assigned: any[]) => void;
}

export function QuestionnaireLibrary({
  patientUid,
  patientAge,
  ageVariant = 'adult',
  onAssignmentSuccess,
}: QuestionnaireLibraryProps) {
  const { user } = useFirebaseUser();
  const functions = getFunctions();

  const [library, setLibrary] = useState<LibraryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Chargement de la bibliothèque avec useCallback
  const loadLibrary = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const getLibrary = httpsCallable(functions, 'getQuestionnaireLibrary');
      const result = await getLibrary({});

      const data = result.data as { success: boolean; data: LibraryData };
      if (data.success) {
        setLibrary(data.data);
      } else {
        throw new Error('Échec chargement bibliothèque');
      }
    } catch (error) {
      console.error('Erreur chargement bibliothèque:', error);
      toast.error('Erreur lors du chargement de la bibliothèque');
    } finally {
      setLoading(false);
    }
  }, [user, functions]);

  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  // Gestion des sélections de questionnaires
  const handleTemplateToggle = (templateId: string) => {
    setSelectedTemplates((prev) =>
      prev.includes(templateId) ? prev.filter((id) => id !== templateId) : [...prev, templateId]
    );
  };

  // Assignation des questionnaires sélectionnés
  const handleAssignSelected = async () => {
    if (!user || selectedTemplates.length === 0) return;

    try {
      setAssignmentLoading(true);
      const assignQuestionnaires = httpsCallable(functions, 'assignSelectedQuestionnaires');

      const result = await assignQuestionnaires({
        patientUid,
        templateIds: selectedTemplates,
        ageVariant,
        practitionerUid: user.uid,
      });

      const data = result.data as { success: boolean; assigned: any[] };
      if (data.success) {
        toast.success(`${data.assigned.length} questionnaires assignés avec succès`);
        setSelectedTemplates([]);
        onAssignmentSuccess?.(data.assigned);
      } else {
        throw new Error('Échec assignation questionnaires');
      }
    } catch (error) {
      console.error('Erreur assignation:', error);
      toast.error("Erreur lors de l'assignation des questionnaires");
    } finally {
      setAssignmentLoading(false);
    }
  };

  // Filtrage des questionnaires
  const filteredTemplates =
    library?.templates.filter((template) => {
      const matchesSearch =
        !searchTerm ||
        template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.tags?.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      const matchesAgeVariant = template.availableVariants.includes(ageVariant);

      return matchesSearch && matchesCategory && matchesAgeVariant;
    }) || [];

  if (loading) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la bibliothèque...</p>
        </div>
      </Card>
    );
  }

  if (!library) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <p className="text-red-600">Erreur lors du chargement de la bibliothèque</p>
          <Button onClick={loadLibrary} className="mt-4">
            Réessayer
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-4">
            <Tag className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Bibliothèque de Questionnaires</h2>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{library.stats.totalTemplates}</div>
              <div className="text-sm text-gray-600">Questionnaires</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{library.stats.totalVariants}</div>
              <div className="text-sm text-gray-600">Variantes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {library.stats.categoriesCount}
              </div>
              <div className="text-sm text-gray-600">Catégories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{filteredTemplates.length}</div>
              <div className="text-sm text-gray-600">Compatibles</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Contrôles de recherche et filtre */}
      <Card>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher des questionnaires..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Toutes catégories</option>
                {library.stats.categories.map((category) => (
                  <option key={category} value={category}>
                    {category} ({library.categories[category]?.length || 0})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              <Badge variant="outline" className="flex items-center gap-1">
                Âge: {patientAge ? `${patientAge} ans` : 'Non spécifié'}
                <span className="text-blue-600">({ageVariant})</span>
              </Badge>
            </div>

            {selectedTemplates.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  {selectedTemplates.length} sélectionnés
                </span>
                <Button onClick={handleAssignSelected} disabled={assignmentLoading} size="sm">
                  {assignmentLoading ? 'Assignation...' : 'Assigner Sélectionnés'}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Liste des questionnaires */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => (
          <Card
            key={template.id}
            className="relative"
            onClick={() => handleTemplateToggle(template.id)}
          >
            <CardContent>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">{template.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                </div>
                <Checkbox checked={selectedTemplates.includes(template.id)} readOnly />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <Badge variant="secondary" className="text-xs">
                    {template.category}
                  </Badge>
                  <span className="text-gray-500">{template.estimatedTime} min</span>
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs text-blue-600">
                    {template.difficulty}
                  </Badge>
                  <div className="flex gap-1">
                    {template.availableVariants.map((variant) => (
                      <Badge
                        key={variant}
                        variant={variant === ageVariant ? 'default' : 'outline'}
                        className="text-xs"
                      >
                        {variant}
                      </Badge>
                    ))}
                  </div>
                </div>

                {template.tags && template.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-2">
                    {template.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                    {template.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </CardContent>

            {selectedTemplates.includes(template.id) && (
              <div className="absolute top-2 right-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            )}
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun questionnaire trouvé</h3>
            <p className="text-gray-600">
              Essayez d'ajuster vos critères de recherche ou de filtres.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default QuestionnaireLibrary;
