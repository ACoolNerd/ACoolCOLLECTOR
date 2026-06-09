import pandas as pd
import os
from datetime import datetime

def process_inventory(file_path, output_dir):
    print(f"Loading data from {file_path}...")
    df = pd.read_csv(file_path)
    
    # 1. Take out all grades (set to Raw)
    print("Standardizing all cards to 'Raw'...")
    df['grading-company'] = None
    df['grading-cert-id'] = None
    df['include-string'] = 'Ungraded'
    
    # 2. Profile Duplicates
    print("Profiling duplicates...")
    duplicates = df[df.duplicated(subset=['id'], keep=False)]
    if not duplicates.empty:
        print(f"Found {len(duplicates)} duplicate entries (based on ID).")
        duplicates.to_csv(os.path.join(output_dir, 'duplicates_profile.csv'), index=False)
    else:
        print("No duplicates found based on ID.")
        
    # 3. Identify last 50 entries
    print("Extracting last 50 entries...")
    # Sort by date-entered if possible, otherwise assume order of entry
    if 'date-entered' in df.columns:
        df['date-entered'] = pd.to_datetime(df['date-entered'])
        last_50 = df.sort_values(by='date-entered', ascending=False).head(50)
    else:
        last_50 = df.tail(50)
    
    last_50.to_csv(os.path.join(output_dir, 'last_50_entries.csv'), index=False)
    
    # 4. Save Master Inventory
    master_path = os.path.join(output_dir, 'master_inventory.csv')
    df.to_csv(master_path, index=False)
    print(f"Master inventory saved to {master_path}")
    
    # Summary Report
    print("\n--- Summary Report ---")
    print(f"Total Cards: {len(df)}")
    print(f"Total Value (Pennies): {df['price-in-pennies'].sum()}")
    print(f"Total Value (USD): ${df['price-in-pennies'].sum() / 100:,.2f}")
    print(f"Last 50 entries saved to last_50_entries.csv")
    print("----------------------\n")

if __name__ == "__main__":
    raw_file = "/Users/acoolnerd/ACoolCOLLECTOR/data/raw/ACoolCOLLECTION TO be edited .csv"
    processed_dir = "/Users/acoolnerd/ACoolCOLLECTOR/data/processed"
    
    if not os.path.exists(processed_dir):
        os.makedirs(processed_dir)
        
    if os.path.exists(raw_file):
        process_inventory(raw_file, processed_dir)
    else:
        print(f"Error: Raw file not found at {raw_file}")
