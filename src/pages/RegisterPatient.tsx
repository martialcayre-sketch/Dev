import { Formik, Form, Field, useFormikContext } from 'formik';
import type { FieldProps } from 'formik';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
// import * as Yup from 'yup';

import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { patientRegisterSchema } from '../lib/validators';
import { createPatientProfile, listPractitioners } from '../services/userService';

export default function RegisterPatient() {
  const navigate = useNavigate();
  const [options, setOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    (async () => {
      const list = await listPractitioners();
      const opts = list.map((p) => ({ value: p.uid, label: p.displayName || p.email }));
      setOptions(opts);
    })();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-semibold mb-6">Créer un compte patient</h1>
        <Formik
          initialValues={{ email: '', password: '', displayName: '', chosenPractitionerId: '' }}
          validationSchema={patientRegisterSchema}
          onSubmit={async (values, { setSubmitting }) => {
            try {
              await createPatientProfile(values);
              toast.success('Compte patient créé. Vérifiez votre e-mail.');
              navigate('/patient/pending-approval');
            } catch (e: unknown) {
              const msg = (e as { message?: string })?.message ?? 'Erreur lors de la création';
              toast.error(msg);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form className="space-y-4">
              <AutoSelectPractitioner options={options} />
              <Field name="displayName">
                {({ field }: FieldProps<string>) => (
                  <Input
                    label="Nom affiché"
                    {...field}
                    error={touched.displayName ? (errors.displayName as string | undefined) : undefined}
                  />
                )}
              </Field>
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
              <Field name="chosenPractitionerId">
                {({ field }: FieldProps<string>) => (
                  <Select
                    label="Praticien choisi"
                    options={options}
                    {...field}
                    error={
                      touched.chosenPractitionerId
                        ? (errors.chosenPractitionerId as string | undefined)
                        : undefined
                    }
                  />
                )}
              </Field>
              <Button type="submit" loading={isSubmitting} className="w-full">
                Créer le compte
              </Button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

type PatientFormValues = {
  email: string;
  password: string;
  displayName: string;
  chosenPractitionerId: string;
};

function AutoSelectPractitioner({ options }: { options: { value: string; label: string }[] }) {
  const { values, setFieldValue } = useFormikContext<PatientFormValues>();
  useEffect(() => {
    if (options.length === 1 && !values.chosenPractitionerId) {
      setFieldValue('chosenPractitionerId', options[0].value);
    }
  }, [options, values.chosenPractitionerId, setFieldValue]);
  return null;
}
