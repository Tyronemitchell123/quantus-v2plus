
-- Function: auto-complete deal when all documents are signed
CREATE OR REPLACE FUNCTION public.auto_complete_deal_on_all_docs_signed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _deal_status text;
  _total_docs int;
  _signed_docs int;
BEGIN
  -- Only act when a document is marked as signed
  IF NEW.status <> 'signed' THEN
    RETURN NEW;
  END IF;

  -- Check the deal's current status
  SELECT status INTO _deal_status
  FROM public.deals
  WHERE id = NEW.deal_id;

  -- Only auto-complete deals in 'execution' phase
  IF _deal_status IS NULL OR _deal_status <> 'execution' THEN
    RETURN NEW;
  END IF;

  -- Count total and signed documents for this deal
  SELECT count(*), count(*) FILTER (WHERE status = 'signed')
  INTO _total_docs, _signed_docs
  FROM public.deal_documents
  WHERE deal_id = NEW.deal_id;

  -- If all documents are signed, mark deal as completed
  IF _total_docs > 0 AND _total_docs = _signed_docs THEN
    UPDATE public.deals
    SET status = 'completed',
        completed_at = now(),
        updated_at = now()
    WHERE id = NEW.deal_id
      AND status = 'execution';

    RAISE LOG 'Deal % auto-completed: all % documents signed', NEW.deal_id, _total_docs;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger on deal_documents update
CREATE TRIGGER trg_auto_complete_deal_on_docs_signed
AFTER UPDATE OF status ON public.deal_documents
FOR EACH ROW
WHEN (NEW.status = 'signed' AND OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.auto_complete_deal_on_all_docs_signed();
