CREATE TABLE IF NOT EXISTS irs990_filings_meta (
    return_id text,
    filing_type text,
    ein text,
    tax_period text,
    submitted_on text,
    organization_name text,
    return_type text,
    dln text,
    object_id text,
    release_year text
);

CREATE INDEX IF NOT EXISTS irs990_filings_meta_ein ON irs990_filings_meta (ein);
CREATE INDEX IF NOT EXISTS irs990_filings_meta_object_id ON irs990_filings_meta (object_id);
CREATE INDEX IF NOT EXISTS irs990_filings_meta_submitted_on ON irs990_filings_meta (submitted_on);
CREATE INDEX IF NOT EXISTS irs990_filings_meta_tax_period ON irs990_filings_meta (tax_period);
CREATE INDEX IF NOT EXISTS irs990_filings_meta_release_year ON irs990_filings_meta (release_year);
