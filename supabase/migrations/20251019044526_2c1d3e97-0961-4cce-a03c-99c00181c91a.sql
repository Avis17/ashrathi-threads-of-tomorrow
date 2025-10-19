-- Create employee_contacts table
CREATE TABLE public.employee_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  alternative_contact TEXT NOT NULL,
  department TEXT NOT NULL,
  email TEXT,
  date_of_joining DATE,
  salary NUMERIC,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.employee_contacts ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admins can view all employee contacts"
ON public.employee_contacts
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert employee contacts"
ON public.employee_contacts
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update employee contacts"
ON public.employee_contacts
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete employee contacts"
ON public.employee_contacts
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_employee_contacts_updated_at
BEFORE UPDATE ON public.employee_contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();