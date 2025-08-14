use reqwest;
use serde_json::Value;
use std::process::Command;
use std::time::Duration;
use tokio::time::sleep;

#[tokio::main]
async fn main() {
    println!("AI Test Application DevOps Tools");
    println!("==================================");

    let args: Vec<String> = std::env::args().collect();
    
    if args.len() < 2 {
        print_usage();
        return;
    }

    match args[1].as_str() {
        "health" => {
            health_check().await;
        }
        "build" => {
            build_all();
        }
        "start" => {
            start_all();
        }
        "stop" => {
            stop_all();
        }
        "test" => {
            test_api().await;
        }
        _ => {
            println!("Unknown command: {}", args[1]);
            print_usage();
        }
    }
}

fn print_usage() {
    println!("\nUsage: cargo run -- <command>");
    println!("Commands:");
    println!("  health  - Check health of backend API");
    println!("  build   - Build both frontend and backend");
    println!("  start   - Start all services");
    println!("  stop    - Stop all services");
    println!("  test    - Run API tests");
}

async fn health_check() {
    println!("🏥 Checking API health...");
    
    match reqwest::get("http://localhost:3001/api/health").await {
        Ok(response) => {
            if response.status().is_success() {
                match response.json::<Value>().await {
                    Ok(json) => {
                        println!("✅ API is healthy: {}", json);
                    }
                    Err(_) => {
                        println!("⚠️  API responded but returned invalid JSON");
                    }
                }
            } else {
                println!("❌ API health check failed with status: {}", response.status());
            }
        }
        Err(e) => {
            println!("❌ Failed to connect to API: {}", e);
            println!("💡 Make sure the backend server is running on port 3001");
        }
    }
}

fn build_all() {
    println!("🔨 Building all components...");
    
    // Build backend (just check dependencies)
    println!("📦 Checking backend dependencies...");
    let backend_result = Command::new("npm")
        .args(&["install"])
        .current_dir("../backend")
        .status();
    
    match backend_result {
        Ok(status) => {
            if status.success() {
                println!("✅ Backend dependencies OK");
            } else {
                println!("❌ Backend build failed");
                return;
            }
        }
        Err(e) => {
            println!("❌ Failed to run backend build: {}", e);
            return;
        }
    }

    // Build frontend
    println!("🎨 Building frontend...");
    let frontend_result = Command::new("npm")
        .args(&["run", "build"])
        .current_dir("../frontend")
        .status();
    
    match frontend_result {
        Ok(status) => {
            if status.success() {
                println!("✅ Frontend build successful");
            } else {
                println!("❌ Frontend build failed");
            }
        }
        Err(e) => {
            println!("❌ Failed to run frontend build: {}", e);
        }
    }

    println!("🎉 Build process completed!");
}

fn start_all() {
    println!("🚀 Starting all services...");
    
    println!("💡 To start services manually:");
    println!("   Backend:  cd backend && npm start");
    println!("   Frontend: cd frontend && npm run dev");
    println!("   DevOps:   cd devops && cargo run -- health");
}

fn stop_all() {
    println!("🛑 Stopping services...");
    
    // Kill processes on common ports
    let _ = Command::new("pkill")
        .args(&["-f", "node.*3001"])
        .status();
    
    let _ = Command::new("pkill")
        .args(&["-f", "next-server"])
        .status();
    
    println!("✅ Services stopped");
}

async fn test_api() {
    println!("🧪 Testing API endpoints...");
    
    // Test health endpoint
    print!("Testing health endpoint... ");
    match reqwest::get("http://localhost:3001/api/health").await {
        Ok(response) => {
            if response.status().is_success() {
                println!("✅");
            } else {
                println!("❌ Status: {}", response.status());
                return;
            }
        }
        Err(_) => {
            println!("❌ Connection failed");
            return;
        }
    }

    // Test addition endpoint
    print!("Testing addition endpoint... ");
    let client = reqwest::Client::new();
    let test_data = serde_json::json!({
        "num1": 15.5,
        "num2": 24.3
    });

    match client
        .post("http://localhost:3001/api/add")
        .json(&test_data)
        .send()
        .await
    {
        Ok(response) => {
            if response.status().is_success() {
                match response.json::<Value>().await {
                    Ok(result) => {
                        if let Some(sum) = result.get("sum") {
                            if sum.as_f64() == Some(39.8) {
                                println!("✅ Sum calculation correct: {}", sum);
                            } else {
                                println!("❌ Incorrect sum: {}", sum);
                            }
                        } else {
                            println!("❌ No sum field in response");
                        }
                    }
                    Err(_) => {
                        println!("❌ Invalid JSON response");
                    }
                }
            } else {
                println!("❌ Status: {}", response.status());
            }
        }
        Err(e) => {
            println!("❌ Request failed: {}", e);
        }
    }

    // Test error handling
    print!("Testing error handling... ");
    let invalid_data = serde_json::json!({
        "num1": "invalid",
        "num2": 5
    });

    match client
        .post("http://localhost:3001/api/add")
        .json(&invalid_data)
        .send()
        .await
    {
        Ok(response) => {
            if response.status() == 400 {
                println!("✅ Error handling works");
            } else {
                println!("❌ Expected 400, got: {}", response.status());
            }
        }
        Err(e) => {
            println!("❌ Request failed: {}", e);
        }
    }

    println!("🎉 API tests completed!");
}
