package main

import (
	"fmt"
	"net/http"
)

func main() {

	urls := []string{
		"http://example.com",
		"http://example.com",
		"http://example.com",
	}

	for _, url := range urls {

		resp, err := http.Get(url)
		if err != nil {
			fmt.Printf("Error making request: %v\n", err)
			return
		}
		defer resp.Body.Close()

		fmt.Printf("Status: %s\n", resp.Status)

	}


}
