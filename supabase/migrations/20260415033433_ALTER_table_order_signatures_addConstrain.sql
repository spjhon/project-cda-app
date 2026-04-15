ALTER TABLE public.order_signatures 
ADD CONSTRAINT os_template_sig_fkey 
FOREIGN KEY (template_signature_id) REFERENCES public.order_template_signatures(id);