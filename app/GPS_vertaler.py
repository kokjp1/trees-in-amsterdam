# RUNTIME COMMAND:
# python GPS_vertaler.py data/bomen_gegevens_amsterdam_jameskok.csv -o data/bomen_coordinaten_vertaald.csv

import re
import argparse
import pandas as pd
from pyproj import Transformer
from pathlib import Path

POINT_RE = re.compile(r"POINT\s*\(\s*([+-]?\d+(?:\.\d+)?)\s+([+-]?\d+(?:\.\d+)?)", re.IGNORECASE)

def parse_rd(geom: str):
    if not isinstance(geom, str):
        return None, None
    m = POINT_RE.search(geom)
    if not m:
        return None, None
    return float(m.group(1)), float(m.group(2))

def read_table(path: str, geom_col: str):
    ext = Path(path).suffix.lower()
    if ext != ".csv":
        raise SystemExit(
            f"Only CSV supported now. Convert '{path}' to .csv (Excel: Save As -> CSV UTF-8) and retry."
        )
    try:
        return pd.read_csv(path, sep=None, engine="python", dtype=str)
    except UnicodeDecodeError:
        return pd.read_csv(path, sep=None, engine="python", dtype=str, encoding="cp1252")

def main():
    ap = argparse.ArgumentParser(description="Convert RD (EPSG:28992) POINT() to WGS84 lat/lon (CSV only).")
    ap.add_argument("input_csv", help="Input CSV containing a geometry column with POINT(x y)")
    ap.add_argument("-o", "--output-csv", default=None, help="Output CSV (default: *_wgs84.csv)")
    ap.add_argument("-c", "--geom-column", default="geometrie", help="Name of geometry column")
    args = ap.parse_args()

    df = read_table(args.input_csv, args.geom_column)

    if args.geom_column not in df.columns:
        raise SystemExit(f"Column '{args.geom_column}' not found. Available: {list(df.columns)}")

    xy = df[args.geom_column].apply(parse_rd).apply(pd.Series)
    xy.columns = ["x_rd", "y_rd"]
    df = pd.concat([df, xy], axis=1)

    before = len(df)
    df = df.dropna(subset=["x_rd", "y_rd"]).copy()
    if len(df) < before:
        print(f"Skipped {before - len(df)} rows without valid POINT(x y).")

    transformer = Transformer.from_crs("EPSG:28992", "EPSG:4326", always_xy=True)
    lon, lat = transformer.transform(df["x_rd"].astype(float).values,
                                     df["y_rd"].astype(float).values)
    df["longitude"] = lon
    df["latitude"] = lat

    if args.output_csv:
        out = args.output_csv
    else:
        p = Path(args.input_csv)
        out = str(p.with_name(p.stem + "_wgs84.csv"))

    df.to_csv(out, index=False)
    print(f"Done: {len(df)} rows -> {out}")

if __name__ == "__main__":
    main()
