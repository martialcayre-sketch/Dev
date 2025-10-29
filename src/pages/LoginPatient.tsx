import { signInWithEmailAndPassword } from 'firebase/auth';
import { Formik, Form, Field } from 'formik';
import type { FieldProps } from 'formik';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { auth } from '../lib/firebase';
import { loginSchema } from '../lib/validators';
import { getCurrentUserProfile } from '../services/userService';

export default function LoginPatient() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-semibold mb-6">Connexion patient</h1>
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={loginSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              const cred = await signInWithEmailAndPassword(auth, values.email, values.password);
              const profile = await getCurrentUserProfile();
              if (!cred.user.emailVerified) return navigate('/verify-email');
              if (!profile || profile.role !== 'patient') {
                toast.error('Accès réservé aux patients');
                return navigate('/');
              }
              if (profile.approvalStatus !== 'approved')
                return navigate('/patient/pending-approval');
              navigate('/patient/home');
            } catch (e: unknown) {
              const msg = (e as { message?: string })?.message ?? 'Erreur de connexion';
              toast.error(msg);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form className="space-y-4">
              <Field name="email">
                {({ field }: FieldProps<string>) => (
                  <Input
                    label="Email"
                    type="email"
                    {...field}
                    error={touched.email ? (errors.email as string | undefined) : undefined}
                  />
                )}
              </Field>
              <Field name="password">
                {({ field }: FieldProps<string>) => (
                  <Input
                    label="Mot de passe"
                    type="password"
                    {...field}
                    error={touched.password ? (errors.password as string | undefined) : undefined}
                  />
                )}
              </Field>
              <Button type="submit" loading={isSubmitting} className="w-full">
                Se connecter
              </Button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
